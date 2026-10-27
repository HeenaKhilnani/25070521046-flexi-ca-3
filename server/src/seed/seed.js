import { connectDb, closeDb, getCollection } from '../db.js';
import { getSeededTests } from './seedData.js';

export async function runSeed(customUri = null) {
  console.log('[Seed] Starting NEXTEST database seeding...');

  try {
    await connectDb(customUri);
    const testsCol = getCollection('tests');

    const tests = getSeededTests();
    let inserted = 0;
    let updated = 0;

    for (const testData of tests) {
      const now = new Date();
      const result = await testsCol.updateOne(
        { code: testData.code },
        {
          $set: {
            ...testData,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted += 1;
        console.log(`  + Inserted test: ${testData.code} - "${testData.title}" (${testData.subject})`);
      } else {
        updated += 1;
        console.log(`  * Updated test: ${testData.code} - "${testData.title}" (${testData.subject})`);
      }
    }

    console.log(`\n[Seed] Complete: ${inserted} tests inserted, ${updated} tests updated.`);
    console.log('[Seed] All test schedules and questions successfully synchronized in MongoDB.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    throw error;
  }
}

// Allow direct CLI execution: node server/src/seed/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      await closeDb();
      process.exit(0);
    })
    .catch(async () => {
      await closeDb();
      process.exit(1);
    });
}
