'use server';

import { getPasswordResetTokenByToken } from '@/data/password-reset';
import { getUserByEmail } from '@/data/user';
import { db } from '@/lib/db';
import { NewPasswordSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import * as z from 'zod';

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: 'Token is required' };
  }
  const validationFields = NewPasswordSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: 'Invalid fields!' };
  }
  const { password } = validationFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: 'Invalid token' };
  }

  const hasExpired = new Date() > new Date(existingToken.expires);
  if (hasExpired) {
    return { error: 'Token has expired' };
  }

  const exitingUser = await getUserByEmail(existingToken.email);

  if (!exitingUser) {
    return { error: 'User not found' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.update({
    where: { email: existingToken.email },
    data: { password: hashedPassword },
  });
  await db.passwordResetToken.delete({ where: { id: existingToken.id } });

  return { success: 'Password updated' };
};
