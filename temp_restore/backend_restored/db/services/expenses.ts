import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateExpenseData {
  amount: number;
  title: string;
  category: string;
  date: string;
  userId: string;
  accountId: string;
  merchant: string;
  paymentMethod: string;
  isRecurring?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  title: string;
  category: string;
  date: string;
  userId: string;
  accountId: string;
  merchant: string;
  paymentMethod: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseService {
  static async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        id: nanoid(32),
        ...expenseData,
        isRecurring: expenseData.isRecurring || false,
      },
    });
    return expense;
  }

  static async getExpenseById(id: string): Promise<Expense | null> {
    return await prisma.expense.findUnique({
      where: { id },
    });
  }

  static async getExpensesByUserId(userId: string): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  static async getExpensesByAccountId(accountId: string): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: { accountId },
      orderBy: { date: 'desc' },
    });
  }

  static async updateExpense(id: string, expenseData: Partial<CreateExpenseData>): Promise<Expense> {
    const expense = await prisma.expense.update({
      where: { id },
      data: expenseData,
    });
    return expense;
  }

  static async deleteExpense(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }

  static async getRecentExpenses(userId: string, limit: number = 5): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  static async getExpensesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  static async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    return await prisma.expense.findMany({
      where: { 
        userId,
        category 
      },
      orderBy: { date: 'desc' },
    });
  }

  static async getTotalExpensesForMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const expenses = await this.getExpensesByDateRange(userId, startDate, endDate);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}
