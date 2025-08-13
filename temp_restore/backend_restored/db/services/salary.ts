import { prisma } from '../prisma';
import { AccountService } from './accounts';

export interface SalaryDepositData {
  userId: string;
  amount: number;
  accountId: string;
  date: Date;
}

export class SalaryService {
  /**
   * Check if salary should be auto-deposited for a user
   */
  static async shouldDepositSalary(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        autoAddSalary: true,
        salary: true,
        salaryDate: true,
        salaryAccountId: true,
      },
    });

    if (!user || !user.autoAddSalary || !user.salaryAccountId) {
      return false;
    }

    const today = new Date();
    return today.getDate() === user.salaryDate;
  }

  /**
   * Process salary auto-deposit for a user
   */
  static async processSalaryDeposit(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          salary: true,
          salaryAccountId: true,
        },
      });

      if (!user || !user.salaryAccountId) {
        return false;
      }

      // Update account balance
      const account = await AccountService.getAccountById(user.salaryAccountId);
      if (!account) {
        return false;
      }

      const newBalance = account.balance + user.salary;
      await AccountService.updateBalance(user.salaryAccountId, newBalance);

      // Log the salary deposit (you could create a separate table for this)
      console.log(`Salary deposit processed: ${user.salary} added to account ${user.salaryAccountId} for user ${userId}`);

      return true;
    } catch (error) {
      console.error('Error processing salary deposit:', error);
      return false;
    }
  }

  /**
   * Process salary deposits for all eligible users
   */
  static async processAllSalaryDeposits(): Promise<number> {
    try {
      const users = await prisma.user.findMany({
        where: {
          autoAddSalary: true,
          salaryAccountId: { not: null },
        },
        select: {
          id: true,
          salary: true,
          salaryDate: true,
          salaryAccountId: true,
        },
      });

      let processedCount = 0;
      const today = new Date();

      for (const user of users) {
        if (today.getDate() === user.salaryDate) {
          const success = await this.processSalaryDeposit(user.id);
          if (success) {
            processedCount++;
          }
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing all salary deposits:', error);
      return 0;
    }
  }

  /**
   * Update user's salary settings
   */
  static async updateSalarySettings(
    userId: string,
    settings: {
      salary?: number;
      salaryDate?: number;
      autoAddSalary?: boolean;
      salaryAccountId?: string;
    }
  ): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: settings,
      });
      return true;
    } catch (error) {
      console.error('Error updating salary settings:', error);
      return false;
    }
  }
}
