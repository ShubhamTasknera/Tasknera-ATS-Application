import prisma from '../config/prisma';

async function main() {
  const cols = await prisma.$queryRawUnsafe<any[]>(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'evaluations';"
  );
  console.log('COLUMNS IN EVALUATIONS:', cols.map(c => `${c.column_name} (${c.data_type})`));
}

main().finally(() => prisma.$disconnect());
