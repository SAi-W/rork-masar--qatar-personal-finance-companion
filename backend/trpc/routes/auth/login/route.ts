import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { UserService } from '../../../../db/services/users';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const loginProcedure = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }: { input: z.infer<typeof loginSchema> }) => {
    try {
      console.log('Login procedure called with input:', input.email);
      const { email, password } = input;

      // Find user by email
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED', 
          message: 'Invalid email or password' 
        });
      }

      // Verify password (bcrypt)
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED', 
          message: 'Invalid email or password' 
        });
      }

      // Create session
      const session = await UserService.createSession(user.id);

      console.log('Login successful for user:', user.id);

      return {
        user: {
          id: user.id,
          full_name: user.fullName,
          email: user.email,
          lang: user.lang,
          salary: user.salary,
          salaryDate: user.salaryDate,
          autoAddSalary: user.autoAddSalary,
          side_income: 0, // Will be calculated from SideIncome model
          onboarding_completed: false, // Default value
        },
        token: session.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Re-throw TRPC errors as-is
      if (error instanceof TRPCError) {
        throw error;
      }
      
      // Handle other errors
      throw new TRPCError({ 
        code: 'INTERNAL_SERVER_ERROR', 
        message: 'Login failed. Please try again.' 
      });
    }
  });