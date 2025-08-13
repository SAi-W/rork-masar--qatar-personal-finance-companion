import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../db/prisma';

type Category = 'food' | 'transportation' | 'housing' | 'utilities' | 'entertainment' | 'shopping' | 'health' | 'education' | 'travel' | 'other';

export const listExpensesProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: { userId: string } }) => {
    const userExpenses = await prisma.expense.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: 'desc' },
    });
    return userExpenses as any;
  });