import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { SubscriptionService } from '../../../../db/services/subscriptions';
import { nanoid } from 'nanoid';

const createSubscriptionSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  amount: z.number().positive('Amount must be positive'),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly', 'weekly', 'bi-weekly']),
  nextBillingDate: z.string().min(1, 'Next billing date is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'paused', 'canceled']),
  autoDeduct: z.boolean().default(true),
  reminderDays: z.number().int().min(0).max(30).default(3),
  accountId: z.string().min(1, 'Account ID is required'),
});

export const createSubscriptionProcedure = protectedProcedure
  .input(createSubscriptionSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('Create subscription procedure called for user:', ctx.userId);
      
      const subscription = await SubscriptionService.createSubscription({
        userId: ctx.userId,
        serviceName: input.serviceName,
        amount: input.amount,
        billingCycle: input.billingCycle,
        nextBillingDate: input.nextBillingDate,
        category: input.category,
        status: input.status,
        autoDeduct: input.autoDeduct,
        reminderDays: input.reminderDays,
        accountId: input.accountId,
      });

      console.log('Subscription created successfully:', subscription.id);
      return subscription;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  });
