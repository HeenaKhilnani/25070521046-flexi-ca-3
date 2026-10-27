/**
 * Server-side examination scoring engine.
 * Computes official marks, percentages, pass/fail status, and breakdown.
 */
export class ScoringService {
  /**
   * Score an examination attempt securely.
   *
   * @param {Array} questions - Private test questions from database (with correctOptionId)
   * @param {Object} savedResponses - Student's saved answers map { [qId]: optionId }
   * @param {Number} passMarks - Minimum marks required to pass
   */
  static calculateScore(questions, savedResponses = {}, passMarks = 0) {
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const breakdown = questions.map((q) => {
      const qMarks = Number(q.marks) || 1;
      totalMarks += qMarks;

      const studentAnswer = savedResponses[q.id] || null;
      const isUnanswered = !studentAnswer;
      const isCorrect = !isUnanswered && studentAnswer === q.correctOptionId;

      let marksAwarded = 0;

      if (isUnanswered) {
        unansweredCount += 1;
        marksAwarded = 0;
      } else if (isCorrect) {
        correctCount += 1;
        marksAwarded = qMarks;
        score += qMarks;
      } else {
        incorrectCount += 1;
        marksAwarded = 0;
      }

      return {
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        studentAnswer,
        correctOptionId: q.correctOptionId,
        isCorrect,
        isUnanswered,
        marksAwarded,
        marksPossible: qMarks,
        explanation: q.explanation || null
      };
    });

    const percentage = totalMarks > 0
      ? Math.round((score / totalMarks) * 1000) / 10
      : 0;

    const passed = typeof passMarks === 'number' && passMarks > 0
      ? score >= passMarks
      : percentage >= 50; // Default 50% pass mark if none configured

    return {
      score,
      totalMarks,
      percentage,
      passed,
      passMarks,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      questionBreakdown: breakdown
    };
  }
}
