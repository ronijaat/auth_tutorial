'use server';

import { signIn } from '@/auth';
import { getTwoFactorTokenByUserId } from '@/data/two-factor-confirmation';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { getUserByEmail } from '@/data/user';
import { db } from '@/lib/db';
import { sendTwoFactorEmail, sendVerificationEmail } from '@/lib/mail';
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from '@/lib/tokens';
import { DEFAULT_LOGIN_REDIRECT } from '@/route';
import { LoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';
import * as z from 'zod';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }
  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  console.log(existingUser);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {
      error: 'Email does not exist!',
    };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return {
      success: 'Email not verified! Confirmation email sent!',
    };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return {
          error: 'Invalid code!',
        };
      }
      if (twoFactorToken.token !== code) {
        return {
          error: 'Invalid code!',
        };
      }

      const hasExpired = new Date() > new Date(twoFactorToken.expires);
      if (hasExpired) {
        return {
          error: 'Code has expired!',
        };
      }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const existingConfirmation = await getTwoFactorTokenByUserId(
        existingUser.id
      );
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id,
          },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorEmail(existingUser.email, twoFactorToken.token);
      return {
        twoFactor: true,
      };
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (e) {
    // console.log('error in  login', e);
    if (e instanceof AuthError) {
      switch (e.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid credentials!',
          };
        default:
          return {
            error: 'Something went wrong!',
          };
      }
    }
    throw e;
  }
};
