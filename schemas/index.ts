import { UserRole } from '@prisma/client';
import * as z from 'zod';

export const SettingSchmea = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'New Password is required',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: 'Password is required',
      path: ['password'],
    }
  );
export const NewPasswordSchema = z.object({
  password: z.string().min(6, 'Minimum 6 characters required'),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(1, 'Password is required'),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(6, 'Minimum 6 characters required'),
  name: z.string().min(1, 'Name is required'),
});
