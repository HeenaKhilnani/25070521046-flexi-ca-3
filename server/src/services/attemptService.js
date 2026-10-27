import { ObjectId } from 'mongodb';
import { getCollection } from '../db.js';
import { TestService } from './testService.js';
import { ScoringService } from './scoringService.js';

export class AttemptService {
  /**
   * Start a new attempt or resume an existing in-progress attempt.
   */
  static async startOrResumeAttempt(studentId, testId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const tId = typeof testId === 'string' ? new ObjectId(testId) : testId;

    const testsCol = getCollection('tests');
    const test = await testsCol.findOne({ _id: tId });

    if (!test || !test.isPublished) {
      const err = new Error('Test not found or not published.');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();

    // Verify scheduled start time
    if (new Date(test.startTime) > now) {
      const err = new Error('This test is not open yet. Please check the scheduled start time.');
      err.statusCode = 403;
      throw err;
    }

    // Verify scheduled end time
    if (new Date(test.endTime) < now) {
      const err = new Error('This test has concluded and is no longer accepting attempts.');
      err.statusCode = 403;
      throw err;
    }

    const attemptsCol = getCollection('attempts');

    // 1. Check for an active in-progress attempt
    const activeAttempt = await attemptsCol.findOne({
      studentId: sId,
      testId: tId,
      status: 'in_progress'
    });

    if (activeAttempt) {
      // Check if authoritative deadline has already passed
      const deadline = new Date(activeAttempt.deadline);
      if (now > deadline) {
        // Auto-finalize timed out attempt
        await this.autoFinalizeTimeout(activeAttempt, test);
      } else {
        // Resume active attempt
        return {
          resumed: true,
          attempt: this.formatAttemptForStudent(activeAttempt, test)
        };
      }
    }

    // 2. Check attempt limits for completed attempts
    const completedAttempts = await attemptsCol
      .find({
        studentId: sId,
        testId: tId,
        status: { $in: ['submitted', 'timed_out'] }
      })
      .toArray();

    const maxAttempts = test.attemptLimit || 1;
    if (completedAttempts.length >= maxAttempts) {
      const err = new Error(`You have reached the maximum allowed attempts (${maxAttempts}) for this test.`);
      err.statusCode = 403;
      throw err;
    }

    // 3. Create fresh attempt with authoritative server timestamps
    const startTime = new Date();
    const durationMs = (test.durationMinutes || 30) * 60 * 1000;
    const deadline = new Date(startTime.getTime() + durationMs);

    const newAttempt = {
      studentId: sId,
      testId: tId,
      attemptNumber: completedAttempts.length + 1,
      status: 'in_progress',
      startTime,
      deadline,
      savedResponses: {},
      submittedAt: null,
      timeTakenSeconds: null,
      score: null,
      totalMarks: test.totalMarks,
      percentage: null,
      passed: null,
      correctCount: null,
      incorrectCount: null,
      unansweredCount: null,
      questionBreakdown: null,
      createdAt: startTime,
      updatedAt: startTime
    };

    const result = await attemptsCol.insertOne(newAttempt);
    newAttempt._id = result.insertedId;

    return {
      resumed: false,
      attempt: this.formatAttemptForStudent(newAttempt, test)
    };
  }

  /**
   * Retrieve active attempt for the authenticated student.
   */
  static async getActiveAttempt(attemptId, studentId) {
    const aId = typeof attemptId === 'string' ? new ObjectId(attemptId) : attemptId;
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const attemptsCol = getCollection('attempts');
    const attempt = await attemptsCol.findOne({ _id: aId, studentId: sId });

    if (!attempt) {
      const err = new Error('Attempt not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const testsCol = getCollection('tests');
    const test = await testsCol.findOne({ _id: attempt.testId });

    if (!test) {
      const err = new Error('Associated test not found.');
      err.statusCode = 404;
      throw err;
    }

    // If still marked in_progress but deadline passed (with 5-second network grace), auto finalize
    const now = new Date();
    if (attempt.status === 'in_progress' && now.getTime() > new Date(attempt.deadline).getTime() + 5000) {
      await this.autoFinalizeTimeout(attempt, test);
      const updated = await attemptsCol.findOne({ _id: aId });
      return {
        isFinalized: true,
        attempt: updated
      };
    }

    return {
      isFinalized: attempt.status !== 'in_progress',
      attempt: this.formatAttemptForStudent(attempt, test)
    };
  }

  /**
   * Save student responses during active attempt.
   */
  static async saveResponses(attemptId, studentId, responses = {}) {
    const aId = typeof attemptId === 'string' ? new ObjectId(attemptId) : attemptId;
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const attemptsCol = getCollection('attempts');
    const attempt = await attemptsCol.findOne({ _id: aId, studentId: sId });

    if (!attempt) {
      const err = new Error('Attempt not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    if (attempt.status !== 'in_progress') {
      const err = new Error('This attempt has already been submitted or finalized.');
      err.statusCode = 400;
      throw err;
    }

    // Check authoritative deadline
    const now = new Date();
    if (now.getTime() > new Date(attempt.deadline).getTime() + 5000) {
      const testsCol = getCollection('tests');
      const test = await testsCol.findOne({ _id: attempt.testId });
      await this.autoFinalizeTimeout(attempt, test);
      const err = new Error('Examination deadline has expired. Your attempt has been submitted automatically.');
      err.statusCode = 408;
      err.expired = true;
      throw err;
    }

    // Merge responses safely
    const currentResponses = attempt.savedResponses || {};
    const mergedResponses = { ...currentResponses, ...responses };

    await attemptsCol.updateOne(
      { _id: aId, studentId: sId, status: 'in_progress' },
      {
        $set: {
          savedResponses: mergedResponses,
          updatedAt: new Date()
        }
      }
    );

    return {
      success: true,
      savedResponses: mergedResponses,
      savedAt: new Date()
    };
  }

  /**
   * Submit and finalize attempt with server-side grading.
   */
  static async submitAttempt(attemptId, studentId, finalResponses = null) {
    const aId = typeof attemptId === 'string' ? new ObjectId(attemptId) : attemptId;
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const attemptsCol = getCollection('attempts');
    const attempt = await attemptsCol.findOne({ _id: aId, studentId: sId });

    if (!attempt) {
      const err = new Error('Attempt not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    if (attempt.status !== 'in_progress') {
      const err = new Error('Attempt has already been submitted.');
      err.statusCode = 400;
      throw err;
    }

    const testsCol = getCollection('tests');
    const test = await testsCol.findOne({ _id: attempt.testId });

    const mergedResponses = {
      ...(attempt.savedResponses || {}),
      ...(finalResponses || {})
    };

    const scoring = ScoringService.calculateScore(
      test.questions,
      mergedResponses,
      test.passMarks
    );

    const submittedAt = new Date();
    const timeTakenSeconds = Math.max(
      1,
      Math.round((submittedAt.getTime() - new Date(attempt.startTime).getTime()) / 1000)
    );

    const updateDoc = {
      status: 'submitted',
      savedResponses: mergedResponses,
      submittedAt,
      timeTakenSeconds,
      score: scoring.score,
      totalMarks: scoring.totalMarks,
      percentage: scoring.percentage,
      passed: scoring.passed,
      correctCount: scoring.correctCount,
      incorrectCount: scoring.incorrectCount,
      unansweredCount: scoring.unansweredCount,
      questionBreakdown: scoring.questionBreakdown,
      updatedAt: submittedAt
    };

    const result = await attemptsCol.findOneAndUpdate(
      { _id: aId, studentId: sId, status: 'in_progress' },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Internal auto-finalize helper when time limit expires.
   */
  static async autoFinalizeTimeout(attempt, test) {
    const attemptsCol = getCollection('attempts');
    const scoring = ScoringService.calculateScore(
      test.questions,
      attempt.savedResponses || {},
      test.passMarks
    );

    const submittedAt = new Date();
    const timeTakenSeconds = Math.max(
      1,
      Math.round((submittedAt.getTime() - new Date(attempt.startTime).getTime()) / 1000)
    );

    await attemptsCol.updateOne(
      { _id: attempt._id, status: 'in_progress' },
      {
        $set: {
          status: 'timed_out',
          submittedAt,
          timeTakenSeconds,
          score: scoring.score,
          totalMarks: scoring.totalMarks,
          percentage: scoring.percentage,
          passed: scoring.passed,
          correctCount: scoring.correctCount,
          incorrectCount: scoring.incorrectCount,
          unansweredCount: scoring.unansweredCount,
          questionBreakdown: scoring.questionBreakdown,
          updatedAt: submittedAt
        }
      }
    );
  }

  /**
   * Get finalized result and detailed review.
   */
  static async getAttemptResult(attemptId, studentId) {
    const aId = typeof attemptId === 'string' ? new ObjectId(attemptId) : attemptId;
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    const attemptsCol = getCollection('attempts');
    const attempt = await attemptsCol.findOne({ _id: aId, studentId: sId });

    if (!attempt) {
      const err = new Error('Result not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    if (attempt.status === 'in_progress') {
      const err = new Error('This attempt is still in progress and cannot be reviewed yet.');
      err.statusCode = 400;
      throw err;
    }

    const testsCol = getCollection('tests');
    const test = await testsCol.findOne({ _id: attempt.testId });

    return {
      attemptId: attempt._id.toString(),
      testId: test._id.toString(),
      testCode: test.code,
      testTitle: test.title,
      subject: test.subject,
      status: attempt.status,
      startTime: attempt.startTime,
      submittedAt: attempt.submittedAt,
      timeTakenSeconds: attempt.timeTakenSeconds,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      passMarks: test.passMarks,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      unansweredCount: attempt.unansweredCount,
      allowReview: test.allowReview !== false,
      questionBreakdown: test.allowReview !== false ? attempt.questionBreakdown : []
    };
  }

  /**
   * Get student's completed attempt history.
   */
  static async getAttemptHistory(studentId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const attemptsCol = getCollection('attempts');

    const attempts = await attemptsCol
      .find({
        studentId: sId,
        status: { $in: ['submitted', 'timed_out'] }
      })
      .sort({ submittedAt: -1 })
      .toArray();

    const testsCol = getCollection('tests');
    const testIds = [...new Set(attempts.map((a) => a.testId))];
    const tests = await testsCol.find({ _id: { $in: testIds } }).toArray();
    const testMap = new Map(tests.map((t) => [t._id.toString(), t]));

    return attempts.map((a) => {
      const test = testMap.get(a.testId.toString()) || {};
      return {
        id: a._id.toString(),
        testId: a.testId.toString(),
        testCode: test.code || 'N/A',
        testTitle: test.title || 'Assessment',
        subject: test.subject || 'General',
        attemptNumber: a.attemptNumber || 1,
        status: a.status,
        startTime: a.startTime,
        submittedAt: a.submittedAt,
        timeTakenSeconds: a.timeTakenSeconds,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        passed: a.passed
      };
    });
  }

  /**
   * Aggregates real dashboard metrics for the student.
   */
  static async getDashboardMetrics(studentId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const now = new Date();

    const testsCol = getCollection('tests');
    const attemptsCol = getCollection('attempts');

    // Available tests query
    const availableTests = await testsCol
      .find({
        isPublished: true,
        startTime: { $lte: now },
        endTime: { $gte: now }
      })
      .sort({ startTime: -1 })
      .toArray();

    // Upcoming tests query
    const upcomingTests = await testsCol
      .find({
        isPublished: true,
        startTime: { $gt: now }
      })
      .sort({ startTime: 1 })
      .limit(3)
      .toArray();

    // Student attempts
    const attempts = await attemptsCol
      .find({
        studentId: sId,
        status: { $in: ['submitted', 'timed_out'] }
      })
      .sort({ submittedAt: -1 })
      .toArray();

    const activeAttempt = await attemptsCol.findOne({
      studentId: sId,
      status: 'in_progress'
    });

    let activeAttemptInfo = null;
    if (activeAttempt) {
      const activeTest = await testsCol.findOne({ _id: activeAttempt.testId });
      if (activeTest) {
        activeAttemptInfo = {
          attemptId: activeAttempt._id.toString(),
          testId: activeTest._id.toString(),
          testTitle: activeTest.title,
          deadline: activeAttempt.deadline
        };
      }
    }

    // Calculate real stats
    const totalCompleted = attempts.length;
    let avgScore = 0;
    let passedCount = 0;

    if (totalCompleted > 0) {
      const sum = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
      avgScore = Math.round((sum / totalCompleted) * 10) / 10;
      passedCount = attempts.filter((a) => a.passed).length;
    }

    // Featured available test (first one not yet attempted or first available)
    const attemptedTestIds = new Set(attempts.map((a) => a.testId.toString()));
    const unattemptedTest = availableTests.find((t) => !attemptedTestIds.has(t._id.toString()));
    const featuredTest = unattemptedTest || availableTests[0] || null;

    // Recent attempts preview (top 3)
    const testIds = [...new Set(attempts.slice(0, 3).map((a) => a.testId))];
    const relatedTests = await testsCol.find({ _id: { $in: testIds } }).toArray();
    const testMap = new Map(relatedTests.map((t) => [t._id.toString(), t]));

    const recentAttempts = attempts.slice(0, 3).map((a) => {
      const t = testMap.get(a.testId.toString()) || {};
      return {
        id: a._id.toString(),
        testTitle: t.title || 'Assessment',
        subject: t.subject || 'General',
        submittedAt: a.submittedAt,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        passed: a.passed
      };
    });

    return {
      stats: {
        availableCount: availableTests.length,
        upcomingCount: upcomingTests.length,
        completedCount: totalCompleted,
        avgScore,
        passedCount
      },
      featuredTest: featuredTest
        ? {
            id: featuredTest._id.toString(),
            code: featuredTest.code,
            title: featuredTest.title,
            subject: featuredTest.subject,
            description: featuredTest.description,
            durationMinutes: featuredTest.durationMinutes,
            totalMarks: featuredTest.totalMarks,
            questionCount: (featuredTest.questions || []).length,
            endTime: featuredTest.endTime
          }
        : null,
      upcomingTests: upcomingTests.map((t) => ({
        id: t._id.toString(),
        code: t.code,
        title: t.title,
        subject: t.subject,
        startTime: t.startTime,
        durationMinutes: t.durationMinutes,
        questionCount: (t.questions || []).length
      })),
      recentAttempts,
      activeAttempt: activeAttemptInfo
    };
  }

  /**
   * Helper to format attempt object for the student UI.
   * NEVER exposes correct answers!
   */
  static formatAttemptForStudent(attempt, test) {
    const sanitizedQuestions = TestService.sanitizeQuestionsForStudent(test.questions);
    return {
      id: attempt._id.toString(),
      testId: test._id.toString(),
      testCode: test.code,
      testTitle: test.title,
      subject: test.subject,
      durationMinutes: test.durationMinutes,
      startTime: attempt.startTime,
      deadline: attempt.deadline,
      serverTime: new Date().toISOString(),
      savedResponses: attempt.savedResponses || {},
      status: attempt.status,
      attemptNumber: attempt.attemptNumber,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions
    };
  }
}
