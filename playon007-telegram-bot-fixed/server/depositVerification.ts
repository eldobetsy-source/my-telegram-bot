import { db } from './db';
import { transactions } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifySyriaTransaction } from './syriaApi';

export async function processPlayerDeposit(
  playerId: string,
  transactionId: string,
  apiKey: string
) {
  const cleanTxId = transactionId.trim();

  const existingTx = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, cleanTxId))
    .limit(1);

  if (existingTx.length > 0) {
    throw new Error('هذا الإيصال تم استخدامه مسبقاً، لا يمكن تكرار العملية.');
  }

  const verification = await verifySyriaTransaction(apiKey, cleanTxId);

  if (!verification.success || verification.status !== 'completed') {
    throw new Error(verification.message || 'فشل التحقق من الحوالة المالية.');
  }

  await db.insert(transactions).values({
    id: cleanTxId,
    playerId: playerId,
    amount: verification.amount,
    status: 'success',
    createdAt: new Date()
  });

  return {
    success: true,
    amount: verification.amount
  };
}
