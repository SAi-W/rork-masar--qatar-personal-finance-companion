import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useAuth } from '@/hooks/useAuthStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import BrutalHeader from '@/components/BrutalHeader';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import CalendarMini from '@/components/dashboard/CalendarMini';
import { Plus, TrendingUp, Calendar, Bell, CreditCard, DollarSign } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatters';

interface DashboardData {
  totalCash: number;
  totalExpenses: number;
  totalIncome: number;
  upcomingBills: any[];
  recentExpenses: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { accounts, expenses, subscriptions, fetchAccounts, fetchExpenses, fetchSubscriptions } = useFinanceStore();
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCash: 0,
    totalExpenses: 0,
    totalIncome: 0,
    upcomingBills: [],
    recentExpenses: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen for expense changes
  useEffect(() => {
    calculateDashboardData();
  }, [expenses, accounts, subscriptions]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchAccounts(),
        fetchExpenses(),
        fetchSubscriptions(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = () => {
    const totalCash = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate upcoming bills (subscriptions due in next 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBills = subscriptions.filter(sub => {
      const dueDate = new Date(sub.nextBillingDate);
      return dueDate >= today && dueDate <= nextWeek;
    });

    // Get recent expenses (last 5)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setDashboardData({
      totalCash,
      totalExpenses,
      totalIncome: user?.salary || 0,
      upcomingBills,
      recentExpenses,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddExpense = () => {
    router.push('/(tabs)/expenses');
  };

  const renderAccountsOverview = () => (
    <BrutalCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          Accounts Overview
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.totalCash}>
        <Text style={styles.totalCashLabel}>Total Cash</Text>
        <Text style={styles.totalCashAmount}>
          {formatCurrency(dashboardData.totalCash)}
        </Text>
      </View>

      <View style={styles.accountsList}>
        {accounts.slice(0, 3).map((account, index) => (
          <View key={account.id} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.nickname}</Text>
              <Text style={styles.accountBank}>{account.bank}</Text>
            </View>
            <Text style={styles.accountBalance}>
              {formatCurrency(account.balance)}
            </Text>
          </View>
        ))}
      </View>
    </BrutalCard>
  );

  const renderCategoryPieChart = () => (
    <CategoryPieChart expenses={expenses} />
  );

  const renderCalendarMini = () => (
    <CalendarMini expenses={expenses} />
  );

  const renderUpcomingBills = () => (
    <BrutalCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          Upcoming Bills
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/subscriptions')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData.upcomingBills.length > 0 ? (
        <View style={styles.billsList}>
          {dashboardData.upcomingBills.slice(0, 3).map((bill, index) => (
            <View key={bill.id} style={styles.billItem}>
              <View style={styles.billInfo}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billDate}>
                  Due: {new Date(bill.nextBillingDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.billAmount}>
                {formatCurrency(bill.amount)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noBills}>
          <Bell size={24} color={COLORS.gray} />
          <Text style={styles.noBillsText}>No upcoming bills</Text>
        </View>
      )}
    </BrutalCard>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
              <BrutalButton
          title="ADD EXPENSE"
          onPress={handleAddExpense}
          variant="primary"
          style={styles.addExpenseButton}
        />
    </View>
  );

  return (
    <View style={styles.container}>
      <BrutalHeader
        title={`Welcome back, ${user?.full_name || 'User'}!`}
        subtitle="Here's your financial overview"
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your financial data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <BrutalButton
            title="Retry"
            onPress={loadDashboardData}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderQuickActions()}
          {renderAccountsOverview()}
          {renderCategoryPieChart()}
          {renderCalendarMini()}
          {renderUpcomingBills()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  addExpenseButton: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.maroon,
    fontWeight: '500',
  },
  periodText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  totalCash: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: COLORS.lightMaroon,
    borderRadius: 12,
  },
  totalCashLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  totalCashAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  accountsList: {
    gap: 12,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  accountBank: {
    fontSize: 14,
    color: COLORS.gray,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.maroon,
  },

  billsList: {
    gap: 12,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  billDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.red,
  },
  noBills: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  noBillsText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 10,
  },
  rtlText: {
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    width: '100%',
  },
});