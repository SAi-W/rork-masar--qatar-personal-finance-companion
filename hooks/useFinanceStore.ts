import { useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Account, 
  Expense, 
  Subscription, 
  Receipt, 
  Deal, 
  SideIncome, 
  User 
} from '@/types';


const STORAGE_KEYS = {
  USER: 'masar_user',
  ACCOUNTS: 'masar_accounts',
  EXPENSES: 'masar_expenses',
  SUBSCRIPTIONS: 'masar_subscriptions',
  RECEIPTS: 'masar_receipts',
  DEALS: 'masar_deals',
  SIDE_INCOMES: 'masar_side_incomes',
};

export const [FinanceProvider, useFinanceStore] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sideIncomes, setSideIncomes] = useState<SideIncome[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to load data from AsyncStorage
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const storedAccounts = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        const storedExpenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
        const storedSubscriptions = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        const storedReceipts = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPTS);
        const storedDeals = await AsyncStorage.getItem(STORAGE_KEYS.DEALS);
        const storedSideIncomes = await AsyncStorage.getItem(STORAGE_KEYS.SIDE_INCOMES);
        
        // Set data from storage or start with empty data
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setAccounts(storedAccounts ? JSON.parse(storedAccounts) : []);
        setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);
        setSubscriptions(storedSubscriptions ? JSON.parse(storedSubscriptions) : []);
        setReceipts(storedReceipts ? JSON.parse(storedReceipts) : []);
        setDeals(storedDeals ? JSON.parse(storedDeals) : []);
        setSideIncomes(storedSideIncomes ? JSON.parse(storedSideIncomes) : []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Start with empty data if there's an error
        setUser(null);
        setAccounts([]);
        setExpenses([]);
        setSubscriptions([]);
        setReceipts([]);
        setDeals([]);
        setSideIncomes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      if (!isLoading) {
        try {
          if (user) await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
          await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
          await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
          await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
          await AsyncStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
          await AsyncStorage.setItem(STORAGE_KEYS.SIDE_INCOMES, JSON.stringify(sideIncomes));
        } catch (error) {
          console.error('Error saving data:', error);
        }
      }
    };

    saveData();
  }, [user, accounts, expenses, subscriptions, receipts, deals, sideIncomes, isLoading]);

  // Accounts
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(accounts.map(acc => 
      acc.id === updatedAccount.id ? updatedAccount : acc
    ));
  };

  const deleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId));
  };

  const getTotalBalance = (): number => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  // Expenses
  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    
    // Update account balance
    const account = accounts.find(acc => acc.id === expense.accountId);
    if (account) {
      const updatedAccount = {
        ...account,
        balance: account.balance - expense.amount
      };
      updateAccount(updatedAccount);
    }
  };

  const updateExpense = (updatedExpense: Expense, originalExpense: Expense) => {
    setExpenses(expenses.map(exp => 
      exp.id === updatedExpense.id ? updatedExpense : exp
    ));
    
    // Update account balance if amount or account changed
    if (
      updatedExpense.amount !== originalExpense.amount || 
      updatedExpense.accountId !== originalExpense.accountId
    ) {
      // Restore original account balance
      if (originalExpense.accountId) {
        const originalAccount = accounts.find(acc => acc.id === originalExpense.accountId);
        if (originalAccount) {
          const updatedOriginalAccount = {
            ...originalAccount,
            balance: originalAccount.balance + originalExpense.amount
          };
          updateAccount(updatedOriginalAccount);
        }
      }
      
      // Update new account balance
      const newAccount = accounts.find(acc => acc.id === updatedExpense.accountId);
      if (newAccount) {
        const updatedNewAccount = {
          ...newAccount,
          balance: newAccount.balance - updatedExpense.amount
        };
        updateAccount(updatedNewAccount);
      }
    }
  };

  const deleteExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
      // Restore account balance
      const account = accounts.find(acc => acc.id === expense.accountId);
      if (account) {
        const updatedAccount = {
          ...account,
          balance: account.balance + expense.amount
        };
        updateAccount(updatedAccount);
      }
      
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    }
  };

  const getRecentExpenses = (limit: number = 5): Expense[] => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  // Subscriptions
  const addSubscription = (subscription: Subscription) => {
    setSubscriptions([...subscriptions, subscription]);
  };

  const updateSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    ));
  };

  const deleteSubscription = (subscriptionId: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
  };

  const getUpcomingSubscriptions = (days: number = 7): Subscription[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return subscriptions.filter(sub => {
      const billingDate = new Date(sub.nextBillingDate);
      return billingDate >= today && billingDate <= futureDate && sub.status === 'active';
    }).sort((a, b) => 
              new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    );
  };

  // Receipts
  const addReceipt = (receipt: Receipt) => {
    setReceipts([...receipts, receipt]);
  };

  const updateReceipt = (updatedReceipt: Receipt) => {
    setReceipts(receipts.map(rec => 
      rec.id === updatedReceipt.id ? updatedReceipt : rec
    ));
  };

  const deleteReceipt = (receiptId: string) => {
    setReceipts(receipts.filter(rec => rec.id !== receiptId));
  };

  // Side Incomes
  const addSideIncome = (income: SideIncome) => {
    setSideIncomes([...sideIncomes, income]);
    
    // Update account balance if it's linked to an account
    if (income.source === 'Salary') {
      const primaryAccount = accounts[0]; // First account as primary for now
      if (primaryAccount) {
        const updatedAccount = {
          ...primaryAccount,
          balance: primaryAccount.balance + income.amount
        };
        updateAccount(updatedAccount);
      }
    }
  };

  const updateSideIncome = (updatedIncome: SideIncome) => {
    setSideIncomes(sideIncomes.map(inc => 
      inc.id === updatedIncome.id ? updatedIncome : inc
    ));
  };

  const deleteSideIncome = (incomeId: string) => {
    setSideIncomes(sideIncomes.filter(inc => inc.id !== incomeId));
  };

  // Deals
  const upvoteDeal = (dealId: string) => {
    setDeals(deals.map(deal => 
      deal.id === dealId 
        ? { ...deal, upvotes: deal.upvotes + 1 }
        : deal
    ));
  };

  const addDeal = (deal: Deal) => {
    setDeals([...deals, deal]);
  };

  const updateDeal = (updatedDeal: Deal) => {
    setDeals(deals.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ));
  };

  const deleteDeal = (dealId: string) => {
    setDeals(deals.filter(deal => deal.id !== dealId));
  };

  // User
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Fetch methods for API calls
  const fetchAccounts = async () => {
    // This would typically make an API call
    // For now, we'll just return the current accounts
    return accounts;
  };

  const fetchExpenses = async () => {
    // This would typically make an API call
    // For now, we'll just return the current expenses
    return expenses;
  };

  const fetchSubscriptions = async () => {
    // This would typically make an API call
    // For now, we'll just return the current subscriptions
    return subscriptions;
  };

  // Clear all data (for testing/reset purposes)
  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setUser(null);
      setAccounts([]);
      setExpenses([]);
      setSubscriptions([]);
      setReceipts([]);
      setDeals([]);
      setSideIncomes([]);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return {
    user,
    accounts,
    expenses,
    subscriptions,
    receipts,
    deals,
    sideIncomes,
    isLoading,
    
    // Accounts
    addAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance,
    
    // Expenses
    addExpense,
    updateExpense,
    deleteExpense,
    getRecentExpenses,
    
    // Subscriptions
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getUpcomingSubscriptions,
    
    // Receipts
    addReceipt,
    updateReceipt,
    deleteReceipt,
    
    // Side Incomes
    addSideIncome,
    updateSideIncome,
    deleteSideIncome,
    
    // Deals
    upvoteDeal,
    addDeal,
    updateDeal,
    deleteDeal,
    
    // User
    updateUser,
    
    // Fetch methods
    fetchAccounts,
    fetchExpenses,
    fetchSubscriptions,
    
    // Utility
    clearAllData,
  };
});

// Custom hooks for specific data
export const useAccounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, getTotalBalance } = useFinanceStore();
  return { accounts, addAccount, updateAccount, deleteAccount, getTotalBalance };
};

export const useExpenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, getRecentExpenses } = useFinanceStore();
  return { expenses, addExpense, updateExpense, deleteExpense, getRecentExpenses };
};

export const useSubscriptions = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, getUpcomingSubscriptions, fetchSubscriptions } = useFinanceStore();
  return { subscriptions, addSubscription, updateSubscription, deleteSubscription, getUpcomingSubscriptions, fetchSubscriptions };
};