import { db } from '../db/database';

export async function getNextBillNumber(): Promise<string> {
  const settings = await db.appSettings.toCollection().first();
  if (!settings || settings.id === undefined) throw new Error('Settings not initialized');
  const num = settings.nextBillNumber;
  await db.appSettings.update(settings.id, { nextBillNumber: num + 1 });
  const prefix = settings.billPrefix;
  if (!prefix || prefix === '01' || prefix === '#') {
    return num.toString().padStart(4, '0');
  }
  return `${prefix}-${num.toString().padStart(4, '0')}`;
}
