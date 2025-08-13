import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  lang?: string;
  salary?: number;
  salaryDate?: number;
  autoAddSalary?: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  lang: string;
  salary: number;
  salaryDate: number;
  autoAddSalary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        id: nanoid(32),
        ...userData,
        lang: userData.lang || 'en',
        salary: userData.salary || 0,
        salaryDate: userData.salaryDate || 1,
        autoAddSalary: userData.autoAddSalary || false,
      },
    });
    console.log('User created:', user.id);
    return user as User;
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as User | null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  static async updateUser(id: string, userData: Partial<CreateUserData>): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: userData,
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user as User;
  }

  static async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  // For now, we'll store sessions in memory since we don't have a Session model in Prisma
  // In production, you should add a Session model to your Prisma schema
  private static sessions = new Map<string, SessionData>();

  static async createSession(userId: string): Promise<SessionData> {
    const token = nanoid(64);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const sessionData: SessionData = {
      id: nanoid(32),
      userId,
      token,
      expiresAt,
    };

    this.sessions.set(token, sessionData);
    return sessionData;
  }

  static async getSessionByToken(token: string): Promise<SessionData | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  static async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }
}
