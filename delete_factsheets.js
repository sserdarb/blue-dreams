const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.page.deleteMany({ where: { slug: 'factsheet' } });
  console.log('Deleted pages:', res);
}
main().finally(() => prisma.$disconnect());
