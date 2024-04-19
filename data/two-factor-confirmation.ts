import { db } from '@/lib/db';

export const getTwoFactorTokenByUserId = async (userId: string) => {
  try {
    const twoFactorToken = await db.twoFactorConfirmation.findUnique({
      where: {
        userId,
      },
    });
    return twoFactorToken;
  } catch (e) {
    return null;
  }
};
