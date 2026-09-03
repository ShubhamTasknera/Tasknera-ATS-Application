import prisma from '../config/prisma';

async function main() {
  console.log('Running migration: Add evaluated_by to evaluations table...');

  await prisma.$executeRawUnsafe(`
    ALTER TABLE evaluations 
    ADD COLUMN IF NOT EXISTS evaluated_by UUID REFERENCES users(id) ON DELETE SET NULL;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_evaluations_evaluated_by ON evaluations(evaluated_by);
  `);

  const updatedCount = await prisma.$executeRawUnsafe(`
    UPDATE evaluations 
    SET evaluated_by = created_by_user_id 
    WHERE evaluated_by IS NULL;
  `);

  console.log(`✓ Migration complete! Synced ${updatedCount} existing evaluations with evaluated_by.`);
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
