import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Expense } from '@/types';
import { formatMoney, DEFAULT_CURRENCY } from '@/utils/currency';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';

interface TransactionHistoryProps {
  expenses: Expense[];
  accountId?: string;
  showLimit?: number;
  showAccount?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  expenses, 
  accountId, 
  showLimit = 10,
  showAccount = true
}) => {
  // Filter expenses for this account if accountId is provided, and sort by date (newest first)
  const filteredExpenses = accountId 
    ? expenses.filter(expense => expense.accountId === accountId)
    : expenses;
    
  const sortedExpenses = filteredExpenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, showLimit);

  // Calculate insights
  const totalSpent = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = sortedExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return expenseDate >= thirtyDaysAgo;
  });
  const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate spending trend (comparing to previous month)
  const spendingTrend = (() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const currentMonth = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const previousMonth = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        const isInPreviousMonth = expenseDate >= sixtyDaysAgo && expenseDate < thirtyDaysAgo;
        const isSameAccount = accountId ? expense.accountId === accountId : true;
        return isInPreviousMonth && isSameAccount;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  })();

  if (sortedExpenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start spending to see your transaction history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Transaction Insights */}
      <View style={styles.insightsContainer}>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <DollarSign size={20} color={COLORS.maroon} />
            <Text style={styles.insightTitle}>Monthly Spending</Text>
          </View>
          <Text style={styles.insightValue}>{formatMoney(monthlySpent, DEFAULT_CURRENCY)}</Text>
          <View style={styles.trendContainer}>
            {spendingTrend > 0 ? (
              <TrendingUp size={16} color={COLORS.error} />
            ) : (
              <TrendingDown size={16} color={COLORS.success} />
            )}
            <Text style={[
              styles.trendText,
              { color: spendingTrend > 0 ? COLORS.error : COLORS.success }
            ]}>
              {Math.abs(spendingTrend).toFixed(1)}% {spendingTrend > 0 ? 'increase' : 'decrease'}
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Calendar size={20} color={COLORS.blue} />
            <Text style={styles.insightTitle}>Total Transactions</Text>
          </View>
          <Text style={styles.insightValue}>{sortedExpenses.length}</Text>
          <Text style={styles.insightSubtext}>
            {monthlyExpenses.length} this month
          </Text>
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {sortedExpenses.map((expense) => (
            <View key={expense.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionIcon}>
                  <DollarSign size={16} color={COLORS.maroon} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{expense.title}</Text>
                  <Text style={styles.transactionMerchant}>{expense.merchant}</Text>
                  {showAccount && expense.accountId && (
                    <Text style={styles.transactionAccount}>
                      Account: {expense.accountId}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  -{formatMoney(expense.amount, DEFAULT_CURRENCY)}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  insightsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  insightCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightSubtext: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  transactionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  transactionMerchant: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  transactionAccount: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
});

export default TransactionHistory;
