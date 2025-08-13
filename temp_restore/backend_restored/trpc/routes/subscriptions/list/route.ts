import { protectedProcedure } from '../../../create-context';
import { SubscriptionService } from '../../../../db/services/subscriptions';

export const listSubscriptionsProcedure = protectedProcedure.query(async ({ ctx }) => {
  try {
    console.log('List subscriptions procedure called for user:', ctx.userId);
    
    const subscriptions = await SubscriptionService.getSubscriptionsByUserId(ctx.userId);
    
    console.log(`Found ${subscriptions.length} subscriptions for user:`, ctx.userId);
    return { items: subscriptions };
  } catch (error) {
    console.error('List subscriptions error:', error);
    throw error;
  }
});
