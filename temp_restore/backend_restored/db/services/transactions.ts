import { prisma } from '../prisma';
import { nanoid } from 'nanoid';
import { AccountService } from './accounts';

export interface CreateTransactionData {
  userId: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description?: string;
  category?: string;
  date: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description?: string;
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionService {
  /**
   * Create a new transaction
   */
  static async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const transaction = await prisma.transaction.create({
      data: {
        id: nanoid(32),
        ...data,
      },
    });

    // Update account balance based on transaction type
    await this.updateAccountBalance(data.accountId, data.type, data.amount);

    return transaction as Transaction;
  }

  /**
   * Add money to an account (deposit)
   */
  static async addMoneyToAccount(
    userId: string,
    accountId: string,
    amount: number,
    description?: string,
    category?: string
  ): Promise<Transaction> {
    return this.createTransaction({
      userId,
      accountId,
      type: 'deposit',
      amount,
      description,
      category,
      date: new Date(),
    });
  }

  /**
   * Remove money from an account (withdrawal)
   */
  static async removeMoneyFromAccount(
    userId: string,
    accountId: string,
    amount: number,
    description?: string,
    category?: string
  ): Promise<Transaction> {
    return this.createTransaction({
      userId,
      accountId,
      type: 'withdrawal',
      amount,
      description,
      category,
      date: new Date(),
    });
  }

  /**
   * Transfer money between accounts
   */
  static async transferMoney(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    // Create withdrawal transaction
    const withdrawal = await this.createTransaction({
      userId,
      accountId: fromAccountId,
      type: 'withdrawal',
      amount,
      description: `Transfer to ${toAccountId}: ${description || ''}`,
      category: 'transfer',
      date: new Date(),
    });
    transactions.push(withdrawal);

    // Create deposit transaction
    const deposit = await this.createTransaction({
      userId,
      accountId: toAccountId,
      type: 'deposit',
      amount,
      description: `Transfer from ${fromAccountId}: ${description || ''}`,
      category: 'transfer',
      date: new Date(),
    });
    transactions.push(deposit);

    return transactions;
  }

  /**
   * Get all transactions for a user
   */
  static async getTransactionsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });
    return transactions as Transaction[];
  }

  /**
   * Get transactions for a specific account
   */
  static async getTransactionsByAccountId(
    accountId: string,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });
    return transactions as Transaction[];
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    return transaction as Transaction | null;
  }

  /**
   * Update account balance based on transaction
   */
  private static async updateAccountBalance(
    accountId: string,
    type: 'deposit' | 'withdrawal' | 'transfer',
    amount: number
  ): Promise<void> {
    const account = await AccountService.getAccountById(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    let newBalance = account.balance;
    
    switch (type) {
      case 'deposit':
        newBalance += amount;
        break;
      case 'withdrawal':
        newBalance -= amount;
        break;
      case 'transfer':
        // Transfer doesn't change total balance, handled separately
        break;
    }

    await AccountService.updateBalance(accountId, newBalance);
  }

  /**
   * Get transaction summary for a user
   */
  static async getTransactionSummary(userId: string, days: number = 30): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    netChange: number;
    transactionCount: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    const totalDeposits = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDeposits,
      totalWithdrawals,
      netChange: totalDeposits - totalWithdrawals,
      transactionCount: transactions.length,
    };
  }
}
