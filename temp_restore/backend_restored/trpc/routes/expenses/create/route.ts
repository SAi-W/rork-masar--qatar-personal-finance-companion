import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { prisma } from '../../../../db/prisma';
import { customAlphabet } from 'nanoid';

const cuid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 24);

const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['food', 'transportation', 'housing', 'utilities', 'entertainment', 'shopping', 'health', 'education', 'travel', 'other']),
  date: z.string(),
  isRecurring: z.boolean().default(false),
  merchant: z.string().min(1, 'Merchant is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  accountId: z.string().min(1, 'Account ID is required'),
});

export const createExpenseProcedure = protectedProcedure
  .input(createExpenseSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof createExpenseSchema>, ctx: { userId: string } }) => {
    const expenseId = `exp_${cuid()}`;
    
    // Create expense
    const expense = await prisma.expense.create({
      data: {
        id: expenseId,
        userId: ctx.userId,
        accountId: input.accountId,
        title: input.title,
        amount: input.amount,
        category: input.category,
        date: input.date,
        isRecurring: input.isRecurring,
        merchant: input.merchant,
        paymentMethod: input.paymentMethod,
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: input.accountId },
      data: { balance: { decrement: input.amount } as any },
    });

    return expense as any;
  });