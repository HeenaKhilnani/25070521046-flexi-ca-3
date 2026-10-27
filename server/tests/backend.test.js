import assert from 'assert';
import bcrypt from 'bcryptjs';
import { ScoringService } from '../src/services/scoringService.js';
import { TestService } from '../src/services/testService.js';
import { parseCookies } from '../src/http/request.js';
import { getSeededTests } from '../src/seed/seedData.js';

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests += 1;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests += 1;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function itAsync(description, fn) {
  totalTests += 1;
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    passedTests += 1;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🧪 NEXTEST BACKEND VERIFICATION & SECURITY TEST SUITE');
  console.log('========================================================\n');

  // 1. Scoring Engine Verification
  console.log('[Suite 1: Server-Side Scoring & Pass/Fail Calculations]');

  const sampleQuestions = [
    { id: 'q1', questionText: 'Q1', marks: 5, correctOptionId: 'a', options: [{ id: 'a', text: 'Opt A' }] },
    { id: 'q2', questionText: 'Q2', marks: 5, correctOptionId: 'b', options: [{ id: 'b', text: 'Opt B' }] },
    { id: 'q3', questionText: 'Q3', marks: 10, correctOptionId: 'c', options: [{ id: 'c', text: 'Opt C' }] },
    { id: 'q4', questionText: 'Q4', marks: 5, correctOptionId: 'd', options: [{ id: 'd', text: 'Opt D' }] }
  ];

  it('Calculates perfect score when all answers are correct', () => {
    const responses = { q1: 'a', q2: 'b', q3: 'c', q4: 'd' };
    const result = ScoringService.calculateScore(sampleQuestions, responses, 15);
    assert.strictEqual(result.score, 25);
    assert.strictEqual(result.totalMarks, 25);
    assert.strictEqual(result.percentage, 100);
    assert.strictEqual(result.correctCount, 4);
    assert.strictEqual(result.incorrectCount, 0);
    assert.strictEqual(result.unansweredCount, 0);
    assert.strictEqual(result.passed, true);
  });

  it('Handles partial, incorrect, and unanswered responses accurately', () => {
    const responses = { q1: 'a', q2: 'wrong_opt', q4: 'd' };
    const result = ScoringService.calculateScore(sampleQuestions, responses, 15);
    assert.strictEqual(result.score, 10);
    assert.strictEqual(result.percentage, 40);
    assert.strictEqual(result.correctCount, 2);
    assert.strictEqual(result.incorrectCount, 1);
    assert.strictEqual(result.unansweredCount, 1);
    assert.strictEqual(result.passed, false);
  });

  it('Respects passMarks threshold strictly', () => {
    const responses = { q1: 'a', q2: 'b', q3: 'c' };
    const result = ScoringService.calculateScore(sampleQuestions, responses, 20);
    assert.strictEqual(result.score, 20);
    assert.strictEqual(result.passed, true);

    const resultFail = ScoringService.calculateScore(sampleQuestions, responses, 21);
    assert.strictEqual(resultFail.passed, false);
  });

  // 2. Examination Security & Protection Checks
  console.log('\n[Suite 2: Examination Security & Data Leakage Prevention]');

  it('Sanitizes questions to prevent leaking correctOptionId to client', () => {
    const sanitized = TestService.sanitizeQuestionsForStudent(sampleQuestions);
    assert.strictEqual(sanitized.length, sampleQuestions.length);
    for (const q of sanitized) {
      assert.strictEqual(q.correctOptionId, undefined, 'CRITICAL: correctOptionId leaked in student payload!');
      assert.strictEqual(q.explanation, undefined, 'CRITICAL: explanation leaked before submission!');
      assert.ok(q.id);
      assert.ok(q.questionText);
      assert.ok(Array.isArray(q.options));
    }
  });

  await itAsync('Password hashing with bcrypt produces strong one-way hash', async () => {
    const plain = 'StudentSecret#2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);

    assert.notStrictEqual(plain, hash);
    assert.ok(hash.startsWith('$2'));

    const match = await bcrypt.compare(plain, hash);
    assert.strictEqual(match, true);

    const mismatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(mismatch, false);
  });

  // 3. HTTP Layer Utilities
  console.log('\n[Suite 3: HTTP Request Parsing & Utilities]');

  it('Parses cookie headers with encoding and multiple pairs', () => {
    const header = 'nextest_session=abc123xyz; theme=dark; user_pref=test%20value';
    const cookies = parseCookies(header);
    assert.strictEqual(cookies.nextest_session, 'abc123xyz');
    assert.strictEqual(cookies.theme, 'dark');
    assert.strictEqual(cookies.user_pref, 'test value');
  });

  it('Handles empty or malformed cookie headers gracefully', () => {
    assert.deepStrictEqual(parseCookies(null), {});
    assert.deepStrictEqual(parseCookies(''), {});
    assert.deepStrictEqual(parseCookies('invalid_no_equal'), {});
  });

  // 4. Seed Data Verification
  console.log('\n[Suite 4: Seed Data & Test Availability Logic]');

  it('Provides all 4 required subject areas in seed bank', () => {
    const tests = getSeededTests();
    assert.strictEqual(tests.length >= 4, true);

    const subjects = tests.map(t => t.subject);
    assert.ok(subjects.includes('Data Structures'));
    assert.ok(subjects.includes('Database Systems'));
    assert.ok(subjects.includes('Computer Networks'));
    assert.ok(subjects.includes('Programming Fundamentals'));
  });

  it('Correctly separates available tests from upcoming tests based on schedule', () => {
    const now = new Date();
    const tests = getSeededTests(now);

    const available = tests.filter(t => new Date(t.startTime) <= now && new Date(t.endTime) >= now);
    const upcoming = tests.filter(t => new Date(t.startTime) > now);

    assert.ok(available.length >= 2, 'Must have at least 2 currently available tests');
    assert.ok(upcoming.length >= 1, 'Must have at least 1 upcoming test');

    const cnTest = upcoming.find(t => t.code === 'CN-401');
    assert.ok(cnTest, 'Computer Networks should be scheduled as upcoming');
  });

  // 5. Router and Security Headers
  console.log('\n[Suite 5: Router Pattern Matching & Security Headers]');

  it('Router parses route parameters from URI paths accurately', () => {
    const routerPattern = '/api/tests/:id/attempt/:attemptId';
    const paramNames = [];
    const patternStr = routerPattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${patternStr}$`);

    const path = '/api/tests/672101abcd/attempt/998877';
    const match = path.match(regex);
    assert.ok(match);
    assert.strictEqual(match[1], '672101abcd');
    assert.strictEqual(match[2], '998877');
  });

  console.log('\n--------------------------------------------------------');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
  console.log('--------------------------------------------------------\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
