import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { SubscriptionService } from '../../../../db/services/subscriptions';

const updateSubscriptionSchema = z.object({
  id: z.string().min(1, 'Subscription ID is required'),
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

export const updateSubscriptionProcedure = protectedProcedure
  .input(updateSubscriptionSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('Update subscription procedure called for user:', ctx.userId, 'subscription:', input.id);
      
      // Verify the subscription belongs to the user
      const existingSubscription = await SubscriptionService.getSubscriptionById(input.id);
      if (!existingSubscription || existingSubscription.userId !== ctx.userId) {
        throw new Error('Subscription not found or access denied');
      }
      
      const subscription = await SubscriptionService.updateSubscription(input.id, {
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

      console.log('Subscription updated successfully:', subscription.id);
      return subscription;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  });
