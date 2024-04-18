'use server';

import * as z from 'zod';

import { getUserByEmail } from '@/data/user';
import { sendPasswordResetEmail } from '@/lib/mail';
import { generatePasswordResetToken } from '@/lib/tokens';
import { ResetSchema } from '@/schemas';

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validationFields = ResetSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: 'Invalid email' };
  }

  const { email } = validationFields.data;

  const exportUser = await getUserByEmail(email);

  if (!exportUser) {
    return { error: 'Email not found' };
  }

  // Send reset email
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: 'Reset Email sent' };
};
