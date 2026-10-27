import { ObjectId } from 'mongodb';
import { getCollection } from '../db.js';

export class TestService {
  /**
   * Sanitizes test questions for student test-taking (strips correct answers & explanations).
   */
  static sanitizeQuestionsForStudent(questions = []) {
    return questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      questionText: q.questionText,
      options: (q.options || []).map((opt) => ({
        id: opt.id,
        text: opt.text
      })),
      marks: q.marks || 1
    }));
  }

  /**
   * Get all currently available tests that are open for attempts.
   */
  static async getAvailableTests(studentId = null) {
    const testsCol = getCollection('tests');
    const now = new Date();

    const query = {
      isPublished: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    };

    const tests = await testsCol.find(query).sort({ startTime: -1 }).toArray();

    // If student is logged in, attach their attempt status for each test
    let studentAttempts = [];
    if (studentId) {
      const attemptsCol = getCollection('attempts');
      studentAttempts = await attemptsCol
        .find({ studentId: new ObjectId(studentId) })
        .toArray();
    }

    return tests.map((t) => {
      const attemptsForTest = studentAttempts.filter(
        (a) => a.testId.toString() === t._id.toString()
      );
      const activeAttempt = attemptsForTest.find((a) => a.status === 'in_progress');
      const completedAttempt = attemptsForTest.find(
        (a) => a.status === 'submitted' || a.status === 'timed_out'
      );

      return {
        id: t._id.toString(),
        code: t.code,
        title: t.title,
        subject: t.subject,
        description: t.description,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        passMarks: t.passMarks,
        questionCount: (t.questions || []).length,
        startTime: t.startTime,
        endTime: t.endTime,
        attemptLimit: t.attemptLimit || 1,
        userStatus: {
          hasActiveAttempt: Boolean(activeAttempt),
          activeAttemptId: activeAttempt ? activeAttempt._id.toString() : null,
          hasCompleted: Boolean(completedAttempt),
          completedAttemptId: completedAttempt ? completedAttempt._id.toString() : null,
          attemptCount: attemptsForTest.length,
          canAttempt: !completedAttempt || (t.attemptLimit && attemptsForTest.length < t.attemptLimit)
        }
      };
    });
  }

  /**
   * Get upcoming tests scheduled for the future.
   */
  static async getUpcomingTests() {
    const testsCol = getCollection('tests');
    const now = new Date();

    const tests = await testsCol
      .find({
        isPublished: true,
        startTime: { $gt: now }
      })
      .sort({ startTime: 1 })
      .toArray();

    return tests.map((t) => ({
      id: t._id.toString(),
      code: t.code,
      title: t.title,
      subject: t.subject,
      description: t.description,
      durationMinutes: t.durationMinutes,
      totalMarks: t.totalMarks,
      questionCount: (t.questions || []).length,
      startTime: t.startTime,
      endTime: t.endTime,
      status: 'upcoming'
    }));
  }

  /**
   * Get test instructions and pre-test metadata.
   */
  static async getTestInstructions(testId, studentId) {
    const tId = typeof testId === 'string' ? new ObjectId(testId) : testId;
    const testsCol = getCollection('tests');
    const test = await testsCol.findOne({ _id: tId });

    if (!test) {
      const err = new Error('Test not found');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const isUpcoming = new Date(test.startTime) > now;
    const isExpired = new Date(test.endTime) < now;

    // Check existing student attempts
    const attemptsCol = getCollection('attempts');
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const attempts = await attemptsCol.find({ studentId: sId, testId: tId }).toArray();

    const activeAttempt = attempts.find((a) => a.status === 'in_progress');
    const completedAttempts = attempts.filter((a) => a.status !== 'in_progress');
    const limitReached = completedAttempts.length >= (test.attemptLimit || 1);

    return {
      id: test._id.toString(),
      code: test.code,
      title: test.title,
      subject: test.subject,
      description: test.description,
      instructions: test.instructions || [
        'Read each question carefully before selecting an answer.',
        'You can navigate between questions freely using Previous and Next or the Question Navigator.',
        'Your selected answers are saved automatically.',
        'The examination will automatically submit when the timer expires.',
        'Once submitted, answers cannot be modified.'
      ],
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      passMarks: test.passMarks,
      questionCount: (test.questions || []).length,
      startTime: test.startTime,
      endTime: test.endTime,
      isUpcoming,
      isExpired,
      canStart: !isUpcoming && !isExpired && !limitReached,
      hasActiveAttempt: Boolean(activeAttempt),
      activeAttemptId: activeAttempt ? activeAttempt._id.toString() : null,
      completedAttemptsCount: completedAttempts.length,
      attemptLimit: test.attemptLimit || 1
    };
  }
}
