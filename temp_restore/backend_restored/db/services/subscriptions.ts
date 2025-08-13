import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateSubscriptionData {
  serviceName: string;
  amount: number;
  category: string;
  billingCycle: string;
  nextBillingDate: string;
  status?: string;
  autoDeduct?: boolean;
  reminderDays?: number;
  userId: string;
  accountId: string;
}

export interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  category: string;
  billingCycle: string;
  nextBillingDate: string;
  status: string;
  autoDeduct: boolean;
  reminderDays: number;
  userId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionService {
  static async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data: {
        id: nanoid(32),
        ...subscriptionData,
        status: subscriptionData.status || 'active',
        autoDeduct: subscriptionData.autoDeduct !== undefined ? subscriptionData.autoDeduct : true,
        reminderDays: subscriptionData.reminderDays || 3,
      },
    });
    return subscription;
  }

  static async getSubscriptionById(id: string): Promise<Subscription | null> {
    return await prisma.subscription.findUnique({
      where: { id },
    });
  }

  static async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return await prisma.subscription.findMany({
      where: { userId },
    });
  }

  static async getActiveSubscriptions(userId: string): Promise<Subscription[]> {
    return await prisma.subscription.findMany({
      where: { 
        userId,
        status: 'active'
      },
    });
  }

  static async updateSubscription(id: string, subscriptionData: Partial<CreateSubscriptionData>): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id },
      data: subscriptionData,
    });
  }

  static async deleteSubscription(id: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  static async getUpcomingSubscriptions(userId: string, days: number = 7): Promise<Subscription[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await prisma.subscription.findMany({
      where: {
        userId,
        status: 'active',
        nextBillingDate: {
          gte: today.toISOString(),
          lte: futureDate.toISOString(),
        },
      },
    });
  }

  static async getTotalMonthlySubscriptions(userId: string): Promise<number> {
    const activeSubscriptions = await this.getActiveSubscriptions(userId);
    return activeSubscriptions.reduce((total, subscription) => total + subscription.amount, 0);
  }

  static async pauseSubscription(id: string): Promise<Subscription> {
    return await this.updateSubscription(id, { status: 'paused' });
  }

  static async resumeSubscription(id: string): Promise<Subscription> {
    return await this.updateSubscription(id, { status: 'active' });
  }

  static async cancelSubscription(id: string): Promise<Subscription> {
    return await this.updateSubscription(id, { status: 'cancelled' });
  }
}
