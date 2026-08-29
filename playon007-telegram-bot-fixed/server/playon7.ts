import axios from 'axios';

interface PlayerAccountData {
  playerId: string;
  username: string;
  balance: number;
  bonusBalance: number;
  status: 'active' | 'suspended';
}

export async function getOrRegisterPlayer(telegramId: string, username: string): Promise<PlayerAccountData> {
  const siteApiUrl = process.env.PLAYON7_API_URL;
  const siteSecretKey = process.env.PLAYON7_SECRET_KEY;

  if (!siteApiUrl || !siteSecretKey) {
    throw new Error('خطأ إعدادات: لم يتم ضبط بيانات PLAYON7_API_URL أو PLAYON7_SECRET_KEY في ملف الـ .env');
  }

  try {
    const response = await axios.post(
      `${siteApiUrl}/v1/players/sync`,
      {
        telegram_id: telegramId,
        username: username
      },
      {
        headers: {
          'X-Secure-Token': siteSecretKey,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    if (response.data && response.data.success) {
      return {
        playerId: response.data.player.id,
        username: response.data.player.username,
        balance: Number(response.data.player.balance),
        bonusBalance: Number(response.data.player.bonus_balance || 0),
        status: response.data.player.status
      };
    }

    throw new Error(response.data?.message || 'فشل مزامنة اللاعب مع قاعدة بيانات الموقع');

  } catch (error: any) {
    throw new Error(`فشل الاتصال بنظام الموقع: ${error.message}`);
  }
}

export async function updatePlayerBalanceOnSite(playerId: string, amount: number): Promise<boolean> {
  const siteApiUrl = process.env.PLAYON7_API_URL;
  const siteSecretKey = process.env.PLAYON7_SECRET_KEY;

  try {
    const response = await axios.post(
      `${siteApiUrl}/v1/players/update-balance`,
      {
        player_id: playerId,
        amount: amount,
        action: 'deposit'
      },
      {
        headers: {
          'X-Secure-Token': siteSecretKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data && response.data.success;
  } catch (error) {
    console.error('فشل تحديث الرصيد في السيرفر الخارجي:', error);
    return false;
  }
}
