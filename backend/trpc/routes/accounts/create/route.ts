import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { AccountService } from '../../../../db/services/accounts';
import { nanoid } from 'nanoid';



const createAccountSchema = z.object({
  bank: z.string().min(1, 'Bank name is required'),
  type: z.enum(['main', 'savings', 'credit', 'wallet', 'cash']),
  nickname: z.string().min(1, 'Nickname is required'),
  balance: z.number().default(0),
  isPrimary: z.boolean().default(false),
});

export const createAccountProcedure = protectedProcedure
  .input(createAccountSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof createAccountSchema>, ctx: { userId: string } }) => {
    try {
      console.log('Create account procedure called for user:', ctx.userId);
      
      const account = await AccountService.createAccount({
        id: `acc_${nanoid()}`,
        userId: ctx.userId,
        bank: input.bank,
        type: input.type,
        nickname: input.nickname,
        balance: input.balance,
        isPrimary: input.isPrimary,
      } as any);

      console.log('Account created successfully:', account.id);

      return account as any;
    } catch (error) {
      console.error('Create account error:', error);
      throw error;
    }
  });