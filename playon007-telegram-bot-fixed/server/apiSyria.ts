import axios from 'axios';

interface VerificationResponse {
  success: boolean;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  message?: string;
}

export async function verifySyriaTransaction(
  apiKey: string,
  transactionId: string
): Promise<VerificationResponse> {
  const cleanTxId = transactionId.trim();

  if (!cleanTxId) {
    return { success: false, amount: 0, status: 'failed', message: 'رقم المعاملة فارغ' };
  }

  try {
    const response = await axios.post(
      'https://apisyria.com/api/v1/transaction/verify',
      { transaction_id: cleanTxId },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        amount: Number(response.data.amount),
        status: 'completed'
      };
    }

    return {
      success: false,
      amount: 0,
      status: 'failed',
      message: response.data?.message || 'المعاملة غير موجودة أو مرفوضة'
    };

  } catch (error: any) {
    return {
      success: false,
      amount: 0,
      status: 'failed',
      message: error.response?.data?.message || 'فشل الاتصال ببوابة API SYRIA'
    };
  }
}
