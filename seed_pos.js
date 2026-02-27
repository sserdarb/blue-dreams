const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isbank = await prisma.paymentSettings.upsert({
    where: { provider: 'isbank' },
    update: { merchantId: '700668106834', apiUsername: 'hotelrunnerapi', apiPassword: 'ADBF5236', terminalId: '700668106834', storeKey: 'Elektraapi2024.', entId: '947', isForeign: false, supportSinglePayment: true, mode: 'live', isActive: true, baseCommissionRate: 0 },
    create: { provider: 'isbank', merchantId: '700668106834', apiUsername: 'hotelrunnerapi', apiPassword: 'ADBF5236', terminalId: '700668106834', storeKey: 'Elektraapi2024.', entId: '947', isForeign: false, supportSinglePayment: true, mode: 'live', isActive: true, baseCommissionRate: 0 }
  });

  const denizbank = await prisma.paymentSettings.upsert({
    where: { provider: 'denizbank' },
    update: { merchantId: '6102', apiUsername: 'apihotelrunner1', apiPassword: 'FUT1dLktQq', terminalId: '6102', storeKey: 'ONVJf', entId: '925', isForeign: false, supportSinglePayment: false, mode: 'live', isActive: true, baseCommissionRate: 0 },
    create: { provider: 'denizbank', merchantId: '6102', apiUsername: 'apihotelrunner1', apiPassword: 'FUT1dLktQq', terminalId: '6102', storeKey: 'ONVJf', entId: '925', isForeign: false, supportSinglePayment: false, mode: 'live', isActive: true, baseCommissionRate: 0 }
  });

  const yapiKredi = await prisma.paymentSettings.upsert({
    where: { provider: 'yapikredi' },
    update: { merchantId: '6702065457', apiUsername: '679714C7', apiPassword: '1010,10,10,10,10,10,10', terminalId: '1010401076043211', storeKey: '10,10,10,10,10,10,10', entId: '952', isForeign: true, supportSinglePayment: true, mode: 'live', isActive: true, baseCommissionRate: 0 },
    create: { provider: 'yapikredi', merchantId: '6702065457', apiUsername: '679714C7', apiPassword: '1010,10,10,10,10,10,10', terminalId: '1010401076043211', storeKey: '10,10,10,10,10,10,10', entId: '952', isForeign: true, supportSinglePayment: true, mode: 'live', isActive: true, baseCommissionRate: 0 }
  });

  const isbankInstallments = [3, 6];
  await prisma.paymentInstallmentRate.deleteMany({ where: { paymentSettingsId: isbank.id } });
  for (const inst of isbankInstallments) { await prisma.paymentInstallmentRate.create({ data: { paymentSettingsId: isbank.id, installments: inst, commissionRate: 0 } }); }

  const denizbankInstallments = [3, 6];
  await prisma.paymentInstallmentRate.deleteMany({ where: { paymentSettingsId: denizbank.id } });
  for (const inst of denizbankInstallments) { await prisma.paymentInstallmentRate.create({ data: { paymentSettingsId: denizbank.id, installments: inst, commissionRate: 0 } }); }

  const yapikrediInstallments = [3, 6];
  await prisma.paymentInstallmentRate.deleteMany({ where: { paymentSettingsId: yapiKredi.id } });
  for (const inst of yapikrediInstallments) { await prisma.paymentInstallmentRate.create({ data: { paymentSettingsId: yapiKredi.id, installments: inst, commissionRate: 0 } }); }

  console.log('POS settings re-seeded accurately based on Pasif check marks.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
