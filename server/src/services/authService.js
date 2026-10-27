import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getCollection } from '../db.js';
import { config } from '../config.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  /**
   * Normalize an email address.
   */
  static normalizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  }

  /**
   * Register a new student.
   */
  static async register({ name, email, password, confirmPassword }) {
    const errors = {};

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Full name is required and must be at least 2 characters.';
    } else if (name.trim().length > 100) {
      errors.name = 'Full name must not exceed 100 characters.';
    }

    // Validate email
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = 'Please provide a valid email address.';
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = errors;
      throw err;
    }

    const studentsCol = getCollection('students');

    // Check duplicate
    const existing = await studentsCol.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 409;
      err.errors = { email: 'An account with this email address already exists.' };
      throw err;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const now = new Date();
    const newStudent = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now
    };

    const result = await studentsCol.insertOne(newStudent);
    const studentId = result.insertedId;

    // Create session
    const sessionToken = await this.createSession(studentId);

    return {
      student: {
        id: studentId.toString(),
        name: newStudent.name,
        email: newStudent.email,
        createdAt: newStudent.createdAt
      },
      token: sessionToken
    };
  }

  /**
   * Authenticate student and create session.
   */
  static async login({ email, password }) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail || !password) {
      const err = new Error('Email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const studentsCol = getCollection('students');
    const student = await studentsCol.findOne({ email: normalizedEmail });

    if (!student) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const sessionToken = await this.createSession(student._id);

    return {
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        createdAt: student.createdAt
      },
      token: sessionToken
    };
  }

  /**
   * Terminate a student session.
   */
  static async logout(sessionToken) {
    if (!sessionToken) return true;
    const sessionsCol = getCollection('sessions');
    await sessionsCol.deleteOne({ token: sessionToken });
    return true;
  }

  /**
   * Create an unguessable crypto session.
   */
  static async createSession(studentId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.sessionMaxAgeMs);

    const sessionsCol = getCollection('sessions');
    await sessionsCol.insertOne({
      token,
      studentId,
      createdAt: new Date(),
      expiresAt
    });

    return token;
  }
}
