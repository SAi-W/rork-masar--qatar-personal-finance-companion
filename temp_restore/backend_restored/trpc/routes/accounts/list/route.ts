import { protectedProcedure } from '../../../create-context';
import { AccountService } from '../../../../db/services/accounts';

export const listAccountsProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { userId: string } }) => {
    try {
      console.log('List accounts procedure called for user:', ctx.userId);
      const userAccounts = await AccountService.getAccountsByUserId(ctx.userId);
      console.log('Found accounts:', userAccounts.length);
      return userAccounts;
    } catch (error) {
      console.error('List accounts error:', error);
      throw error;
    }
  });