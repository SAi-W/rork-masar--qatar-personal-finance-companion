export type Account = {
  id: string;
  bank: string;
  type: 'main' | 'savings' | 'credit' | 'wallet' | 'cash';
  nickname: string;
  balance: number;
  isPrimary: boolean;
  created_by?: string;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  isRecurring: boolean;
  merchant: string;
  paymentMethod: string;
  accountId: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  serviceName: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'weekly' | 'bi-weekly';
  nextBillingDate: string;
  category: Category;
  status: 'active' | 'canceled' | 'paused';
  autoDeduct: boolean;
  accountId: string;
  reminderDays: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Receipt = {
  id: string;
  fileUrl: string;
  thumbUrl: string;
  merchant: string;
  amount: number;
  date: string;
  category: Category;
  accountId: string;
};

export type Deal = {
  id: string;
  title: string;
  merchant: string;
  location: string;
  upvotes: number;
  expiresAt: string;
  imageUrl: string;
  category: Category;
  amount: number;
  discount: number;
  description?: string;
};

export type SideIncome = {
  id: string;
  source: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  date: string;
};

export type Category = 
  | 'food' 
  | 'transportation' 
  | 'housing' 
  | 'utilities' 
  | 'entertainment' 
  | 'shopping' 
  | 'health' 
  | 'education' 
  | 'travel' 
  | 'other';

export type User = {
  id: string;
  full_name: string;
  email: string;
  lang: 'en' | 'ar';
  salary: number;
  salaryDate: number;
  autoAddSalary: boolean;
  salaryAccountId?: string;
  side_income: number;
  onboarding_completed: boolean;
};

// Re-export AppRouter type for client-side use
// AppRouter is server-only; do not re-export backend types into client bundle