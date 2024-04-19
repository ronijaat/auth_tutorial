import { db } from '@/lib/db';

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db.twoFactorToken.findUnique({
      where: {
        token: token,
      },
    });
  } catch (e) {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactoremail = await db.twoFactorToken.findFirst({
      where: {
        email: email,
      },
    });
    return twoFactoremail;
  } catch (e) {
    return null;
  }
};
