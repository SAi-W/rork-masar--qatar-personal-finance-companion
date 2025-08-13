import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateAccountData {
  bank: string;
  type: string;
  nickname: string;
  balance?: number;
  userId: string;
}

export interface Account {
  id: string;
  bank: string;
  type: string;
  nickname: string;
  balance: number;
  isPrimary: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AccountService {
  static async createAccount(accountData: CreateAccountData): Promise<Account> {
    const account = await prisma.account.create({
      data: {
        id: nanoid(32),
        ...accountData,
        balance: accountData.balance || 0,
        isPrimary: false,
      },
    });
    return account as Account;
  }

  static async getAccountById(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    return account as Account | null;
  }

  static async getAccountsByUserId(userId: string): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      where: { userId },
    });
    return accounts as Account[];
  }

  static async updateAccount(id: string, accountData: Partial<CreateAccountData>): Promise<Account> {
    const account = await prisma.account.update({
      where: { id },
      data: accountData,
    });
    return account as Account;
  }

  static async deleteAccount(id: string): Promise<void> {
    await prisma.account.delete({
      where: { id },
    });
  }

  static async updateBalance(accountId: string, newBalance: number): Promise<Account> {
    const account = await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    });
    return account as Account;
  }

  static async getTotalBalance(userId: string): Promise<number> {
    const userAccounts = await this.getAccountsByUserId(userId);
    return userAccounts.reduce((total, account) => total + account.balance, 0);
  }
}
