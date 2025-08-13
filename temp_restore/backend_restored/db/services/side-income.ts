import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateSideIncomeData {
  userId: string;
  title: string;
  amount: number;
  frequency: string;
  category: string;
  description?: string;
}

export interface SideIncome {
  id: string;
  userId: string;
  title: string;
  amount: number;
  frequency: string;
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SideIncomeService {
  /**
   * Create a new side income source
   */
  static async createSideIncome(data: CreateSideIncomeData): Promise<SideIncome> {
    const sideIncome = await prisma.sideIncome.create({
      data: {
        id: nanoid(32),
        ...data,
      },
    });
    return sideIncome as SideIncome;
  }

  /**
   * Get all side incomes for a user
   */
  static async getSideIncomesByUserId(userId: string): Promise<SideIncome[]> {
    const sideIncomes = await prisma.sideIncome.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return sideIncomes as SideIncome[];
  }

  /**
   * Get a specific side income by ID
   */
  static async getSideIncomeById(id: string): Promise<SideIncome | null> {
    const sideIncome = await prisma.sideIncome.findUnique({
      where: { id },
    });
    return sideIncome as SideIncome | null;
  }

  /**
   * Update a side income source
   */
  static async updateSideIncome(
    id: string,
    data: Partial<CreateSideIncomeData>
  ): Promise<SideIncome> {
    const sideIncome = await prisma.sideIncome.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return sideIncome as SideIncome;
  }

  /**
   * Delete a side income source
   */
  static async deleteSideIncome(id: string): Promise<void> {
    await prisma.sideIncome.delete({
      where: { id },
    });
  }

  /**
   * Calculate total monthly side income for a user
   */
  static async getTotalMonthlySideIncome(userId: string): Promise<number> {
    const sideIncomes = await this.getSideIncomesByUserId(userId);
    
    return sideIncomes.reduce((total, income) => {
      let monthlyAmount = 0;
      
      switch (income.frequency) {
        case 'monthly':
          monthlyAmount = income.amount;
          break;
        case 'weekly':
          monthlyAmount = income.amount * 4.33; // Average weeks per month
          break;
        case 'quarterly':
          monthlyAmount = income.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = income.amount / 12;
          break;
        case 'one-time':
          monthlyAmount = 0; // One-time incomes don't contribute to monthly total
          break;
        default:
          monthlyAmount = 0;
      }
      
      return total + monthlyAmount;
    }, 0);
  }

  /**
   * Get side incomes by category for a user
   */
  static async getSideIncomesByCategory(
    userId: string,
    category: string
  ): Promise<SideIncome[]> {
    const sideIncomes = await prisma.sideIncome.findMany({
      where: { 
        userId,
        category 
      },
      orderBy: { createdAt: 'desc' },
    });
    return sideIncomes as SideIncome[];
  }

  /**
   * Get upcoming side income payments for a user
   */
  static async getUpcomingSideIncomes(userId: string, days: number = 30): Promise<SideIncome[]> {
    const sideIncomes = await this.getSideIncomesByUserId(userId);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    // Filter for recurring incomes that will occur within the specified days
    return sideIncomes.filter(income => {
      if (income.frequency === 'one-time') return false;
      
      // For now, we'll return all recurring incomes
      // In a more sophisticated implementation, you'd calculate the next occurrence
      return true;
    });
  }
}
