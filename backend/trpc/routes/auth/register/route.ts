import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../db/prisma';
import bcrypt from 'bcryptjs';
import { UserService } from '../../../../db/services/users';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';


// Simple hash function for passwords (not cryptographically secure, for demo only)
function simpleHash(password: string, salt: string): string {
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

const isEmail = (value: string): boolean => {
  const emailRegex = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
  return emailRegex.test(value);
};

const isPhone = (value: string): boolean => {
  const v = value.replace(/\s|-/g, '');
  if (/^\+?[0-9]{7,15}$/.test(v)) return true;
  if (/^[0-9]{8}$/.test(v)) return true; // Local 8-digit (e.g., Qatar)
  return false;
};

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().refine((val) => isEmail(val) || isPhone(val), 'Invalid email or phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  lang: z.enum(['en', 'ar']).default('en'),
});

export const registerProcedure = publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }: { input: z.infer<typeof registerSchema> }) => {
    try {
      console.log('Register procedure called with input:', input);
      const { fullName, email, password, lang } = input;
      const identifier = email.trim();
      const isEmailId = isEmail(identifier);
      const normalizedId = isEmailId ? identifier.toLowerCase() : identifier.replace(/\s|-/g, '');

      console.log('Registration attempt for:', email);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedId.toLowerCase() } });
      if (existingUser) {
        throw new TRPCError({ 
          code: 'CONFLICT', 
          message: 'Email already in use' 
        });
      }

      // Hash password (bcrypt)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user using UserService
      const user = await UserService.createUser({
        email: normalizedId.toLowerCase(),
        passwordHash: hashedPassword,
        fullName: fullName,
        lang: lang,
        salary: 0,
        salaryDate: 1,
        autoAddSalary: false,
      });

      console.log('User created successfully:', user.id);

      // Create session
      const session = await UserService.createSession(user.id);
      console.log('Session created successfully:', session.id);

      return {
        user: {
          id: user.id,
          full_name: fullName,
          email: user.email,
          lang: lang,
          salary: 0,
          salaryDate: 1,
          autoAddSalary: false,
          side_income: 0,
          onboarding_completed: false,
        },
        token: session.token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle Prisma errors specifically
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({ 
            code: 'CONFLICT', 
            message: 'Email already in use' 
          });
        }
        if (error.code === 'P2021') {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Database schema not ready. Please contact support.' 
          });
        }
      }
      
      // Re-throw TRPC errors as-is
      if (error instanceof TRPCError) {
        throw error;
      }
      
      // Handle other errors
      throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: 'Registration failed. Please try again.' 
      });
    }
  });