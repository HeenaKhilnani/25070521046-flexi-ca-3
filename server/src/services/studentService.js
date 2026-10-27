import { ObjectId } from 'mongodb';
import { getCollection } from '../db.js';

export class StudentService {
  /**
   * Get student profile with aggregated assessment summary.
   */
  static async getProfile(studentId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const studentsCol = getCollection('students');
    const student = await studentsCol.findOne(
      { _id: sId },
      { projection: { passwordHash: 0 } }
    );

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    const attemptsCol = getCollection('attempts');
    const attempts = await attemptsCol
      .find({ studentId: sId, status: { $in: ['submitted', 'timed_out'] } })
      .toArray();

    const totalAttempts = attempts.length;
    let avgPercentage = 0;
    let passedCount = 0;

    if (totalAttempts > 0) {
      const sumPercentage = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
      avgPercentage = Math.round((sumPercentage / totalAttempts) * 10) / 10;
      passedCount = attempts.filter(a => a.passed).length;
    }

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      createdAt: student.createdAt,
      stats: {
        totalAttempts,
        avgPercentage,
        passedCount
      }
    };
  }

  /**
   * Update student name.
   */
  static async updateProfile(studentId, { name }) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      const err = new Error('Name must be at least 2 characters long.');
      err.statusCode = 400;
      throw err;
    }

    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const studentsCol = getCollection('students');

    const result = await studentsCol.findOneAndUpdate(
      { _id: sId },
      { $set: { name: name.trim(), updatedAt: new Date() } },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );

    return {
      id: result._id.toString(),
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  }
}
