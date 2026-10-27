import assert from 'assert';
import { ObjectId } from 'mongodb';
import { AuthService } from '../src/services/authService.js';
import { TestService } from '../src/services/testService.js';
import { AttemptService } from '../src/services/attemptService.js';
import { StudentService } from '../src/services/studentService.js';
import { getSeededTests } from '../src/seed/seedData.js';
import { setCustomCollectionProvider } from '../src/db.js';

let passed = 0;
let total = 0;

function it(desc, fn) {
  total += 1;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
  }
}

async function itAsync(desc, fn) {
  total += 1;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
  }
}

/**
 * Mock MongoDB in-memory collection engine.
 * Emulates the official MongoDB driver collection methods for standalone test verification.
 */
class MockCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  async insertOne(doc) {
    const inserted = { ...doc };
    if (!inserted._id) inserted._id = new ObjectId();
    this.docs.push(inserted);
    return { insertedId: inserted._id };
  }

  async findOne(query) {
    return this.docs.find((d) => this._match(d, query)) || null;
  }

  async updateOne(filter, update, options = {}) {
    let doc = this.docs.find((d) => this._match(d, filter));
    if (!doc && options.upsert) {
      doc = { _id: new ObjectId(), ...(update.$setOnInsert || {}) };
      this.docs.push(doc);
    }
    if (doc && update.$set) {
      Object.assign(doc, update.$set);
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: doc ? 1 : 0, modifiedCount: 0 };
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const doc = this.docs.find((d) => this._match(d, filter));
    if (!doc) return null;
    if (update.$set) Object.assign(doc, update.$set);
    return doc;
  }

  async deleteOne(filter) {
    const idx = this.docs.findIndex((d) => this._match(d, filter));
    if (idx >= 0) {
      this.docs.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  find(query = {}) {
    let result = this.docs.filter((d) => this._match(d, query));
    const cursor = {
      sort: (sortCriteria) => {
        // Simple sort by property
        const [field, order] = Object.entries(sortCriteria)[0] || [];
        if (field) {
          result.sort((a, b) => {
            if (a[field] < b[field]) return order === 1 ? -1 : 1;
            if (a[field] > b[field]) return order === 1 ? 1 : -1;
            return 0;
          });
        }
        return cursor;
      },
      limit: (n) => {
        result = result.slice(0, n);
        return cursor;
      },
      toArray: async () => [...result]
    };
    return cursor;
  }

  _match(doc, query) {
    for (const [key, val] of Object.entries(query)) {
      const docVal = doc[key];
      if (key === '_id' || key.endsWith('Id') || val instanceof ObjectId || docVal instanceof ObjectId) {
        const docStr = docVal ? docVal.toString() : '';
        const queryStr = val ? val.toString() : '';
        if (docStr !== queryStr) return false;
      } else if (key === 'status' && typeof val === 'object' && val.$in) {
        if (!val.$in.includes(doc.status)) return false;
      } else if (val && typeof val === 'object' && (val.$lte || val.$gte || val.$gt)) {
        const dVal = new Date(docVal);
        if (val.$lte && !(dVal <= new Date(val.$lte))) return false;
        if (val.$gte && !(dVal >= new Date(val.$gte))) return false;
        if (val.$gt && !(dVal > new Date(val.$gt))) return false;
      } else if (docVal !== val) {
        return false;
      }
    }
    return true;
  }
}

async function runDbFlowTests() {
  console.log('========================================================');
  console.log('📊 NEXTEST FULL EXAMINATION LIFECYCLE VERIFICATION');
  console.log('========================================================\n');

  // Inject in-memory collections for isolated testing
  const collections = {
    students: new MockCollection('students'),
    tests: new MockCollection('tests'),
    attempts: new MockCollection('attempts'),
    sessions: new MockCollection('sessions')
  };

  setCustomCollectionProvider((name) => {
    if (collections[name]) return collections[name];
    throw new Error(`Unknown collection: ${name}`);
  });

  try {
    // 1. Seed tests into mock db
    const seedTests = getSeededTests();
    for (const t of seedTests) {
      await collections.tests.insertOne({
        ...t,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`  ✓ Seeded ${seedTests.length} tests into test database`);

    // 2. Register Student
    let studentRecord = null;
    let studentToken = null;
    await itAsync('Student Registration creates verified record with hashed password', async () => {
      const reg = await AuthService.register({
        name: 'Jordan Belfort',
        email: 'jordan@college.edu',
        password: 'SecurePassword2026!',
        confirmPassword: 'SecurePassword2026!'
      });
      assert.ok(reg.student);
      assert.strictEqual(reg.student.name, 'Jordan Belfort');
      assert.strictEqual(reg.student.email, 'jordan@college.edu');
      assert.ok(reg.token);
      studentRecord = reg.student;
      studentToken = reg.token;

      // Verify password was hashed in database
      const dbDoc = await collections.students.findOne({ email: 'jordan@college.edu' });
      assert.ok(dbDoc.passwordHash);
      assert.ok(dbDoc.passwordHash.startsWith('$2'));
      assert.notStrictEqual(dbDoc.passwordHash, 'SecurePassword2026!');
    });

    // 3. Duplicate Email Prevention
    await itAsync('Rejects duplicate registration with identical email', async () => {
      let rejected = false;
      try {
        await AuthService.register({
          name: 'Another Student',
          email: 'jordan@college.edu',
          password: 'AnotherPassword123',
          confirmPassword: 'AnotherPassword123'
        });
      } catch (err) {
        rejected = true;
        assert.strictEqual(err.statusCode, 409);
      }
      assert.ok(rejected, 'Expected duplicate email to be rejected with 409');
    });

    // 4. Student Login
    await itAsync('Student Login verifies credentials and generates session', async () => {
      const loginRes = await AuthService.login({
        email: 'jordan@college.edu',
        password: 'SecurePassword2026!'
      });
      assert.ok(loginRes.student);
      assert.strictEqual(loginRes.student.id, studentRecord.id);
      assert.ok(loginRes.token);
    });

    // 5. Test Availability
    let dsTest = null;
    await itAsync('Available Tests lists open examinations with eligibility status', async () => {
      const available = await TestService.getAvailableTests(studentRecord.id);
      assert.ok(available.length >= 2);
      dsTest = available.find((t) => t.code === 'DS-201');
      assert.ok(dsTest, 'DS-201 should be available');
      assert.strictEqual(dsTest.userStatus.canAttempt, true);
    });

    // 6. Test Instructions
    await itAsync('Test Instructions returns metadata without leaking questions or answers', async () => {
      const instructions = await TestService.getTestInstructions(dsTest.id, studentRecord.id);
      assert.strictEqual(instructions.code, 'DS-201');
      assert.strictEqual(instructions.durationMinutes, 25);
      assert.strictEqual(instructions.canStart, true);
      assert.strictEqual(instructions.questions, undefined, 'Questions must NOT be in instructions payload');
    });

    // 7. Start Attempt
    let attemptRecord = null;
    await itAsync('Starting attempt establishes server-authoritative deadline and sanitized questions', async () => {
      const startRes = await AttemptService.startOrResumeAttempt(studentRecord.id, dsTest.id);
      assert.strictEqual(startRes.resumed, false);
      assert.ok(startRes.attempt);
      assert.ok(startRes.attempt.id);
      assert.ok(startRes.attempt.deadline);
      assert.strictEqual(startRes.attempt.status, 'in_progress');
      assert.strictEqual(startRes.attempt.totalQuestions, 6);

      // Verify deadline is exactly 25 minutes after start
      const startMs = new Date(startRes.attempt.startTime).getTime();
      const deadlineMs = new Date(startRes.attempt.deadline).getTime();
      assert.strictEqual(deadlineMs - startMs, 25 * 60 * 1000);

      attemptRecord = startRes.attempt;
    });

    // 8. Resume Attempt (Refresh check)
    await itAsync('Resuming active attempt returns the exact existing attempt and deadline', async () => {
      const resumeRes = await AttemptService.startOrResumeAttempt(studentRecord.id, dsTest.id);
      assert.strictEqual(resumeRes.resumed, true);
      assert.strictEqual(resumeRes.attempt.id, attemptRecord.id);
      assert.strictEqual(resumeRes.attempt.deadline.toISOString(), attemptRecord.deadline.toISOString());
    });

    // 9. Save Responses
    await itAsync('Saving responses persists student choices to database', async () => {
      const saveRes = await AttemptService.saveResponses(attemptRecord.id, studentRecord.id, {
        'ds-q1': 'c', // Correct (5 marks)
        'ds-q2': 'b', // Correct (5 marks)
        'ds-q3': 'b', // Correct (5 marks)
        'ds-q4': 'c'  // Correct (5 marks)
      });
      assert.strictEqual(saveRes.success, true);

      // Verify responses restored upon getActiveAttempt
      const active = await AttemptService.getActiveAttempt(attemptRecord.id, studentRecord.id);
      assert.strictEqual(active.attempt.savedResponses['ds-q1'], 'c');
      assert.strictEqual(active.attempt.savedResponses['ds-q2'], 'b');
    });

    // 10. Final Submit & Server-Side Scoring
    let finalResult = null;
    await itAsync('Submitting exam triggers server-side grading and locks attempt', async () => {
      // Student answers q5 incorrectly ('a' instead of 'b'), leaves q6 unanswered
      const submitRes = await AttemptService.submitAttempt(attemptRecord.id, studentRecord.id, {
        'ds-q5': 'a'
      });
      assert.strictEqual(submitRes.status, 'submitted');
      assert.strictEqual(submitRes.score, 20); // 4 correct * 5 marks = 20
      assert.strictEqual(submitRes.totalMarks, 30);
      assert.strictEqual(submitRes.correctCount, 4);
      assert.strictEqual(submitRes.incorrectCount, 1);
      assert.strictEqual(submitRes.unansweredCount, 1);
      assert.strictEqual(submitRes.passed, true); // 20 >= 15 passMarks
      finalResult = submitRes;
    });

    // 11. Prevent Duplicate Submission
    await itAsync('Prevents modifying or resubmitting finalized attempt', async () => {
      let duplicateRejected = false;
      try {
        await AttemptService.submitAttempt(attemptRecord.id, studentRecord.id, {});
      } catch (err) {
        duplicateRejected = true;
        assert.strictEqual(err.statusCode, 400);
      }
      assert.ok(duplicateRejected);
    });

    // 12. Student Profile & History Aggregation
    await itAsync('Aggregates student transcript and profile accurately from saved attempts', async () => {
      const history = await AttemptService.getAttemptHistory(studentRecord.id);
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].score, 20);
      assert.strictEqual(history[0].passed, true);

      const profile = await StudentService.getProfile(studentRecord.id);
      assert.strictEqual(profile.stats.totalAttempts, 1);
      assert.strictEqual(profile.stats.passedCount, 1);
    });

    // 13. Student Name Update
    await itAsync('Allows updating student profile name with validation', async () => {
      const updated = await StudentService.updateProfile(studentRecord.id, { name: 'Jordan B. Senior' });
      assert.strictEqual(updated.name, 'Jordan B. Senior');
    });

  } finally {
    setCustomCollectionProvider(null);
  }

  console.log('\n--------------------------------------------------------');
  console.log(`Flow Results: ${passed} / ${total} tests passed.`);
  console.log('--------------------------------------------------------\n');

  if (passed < total) {
    process.exit(1);
  }
}

runDbFlowTests().catch((err) => {
  console.error('Fatal Flow test error:', err);
  process.exit(1);
});
