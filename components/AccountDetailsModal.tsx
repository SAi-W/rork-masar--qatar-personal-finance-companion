import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Account, Expense } from '@/types';
import { formatMoney, DEFAULT_CURRENCY } from '@/utils/currency';
import { X, Wallet, Save, CreditCard, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3 } from 'lucide-react-native';
import TransactionHistory from './TransactionHistory';
import BrutalCard from './BrutalCard';
import FormSheet from './ui/FormSheet';

interface AccountDetailsModalProps {
  account: Account | null;
  expenses: Expense[];
  visible: boolean;
  onClose: () => void;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  expenses,
  visible,
  onClose,
}) => {
  if (!account) return null;

  // Calculate account insights
  const accountExpenses = expenses.filter(expense => expense.accountId === account.id);
  const totalSpent = accountExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyExpenses = accountExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return expenseDate >= thirtyDaysAgo;
  });
  
  const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate spending trend
  const spendingTrend = (() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const currentMonth = monthlySpent;
    
    const previousMonth = accountExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= sixtyDaysAgo && expenseDate < thirtyDaysAgo;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  })();

  // Get account type icon
  const getAccountTypeIcon = () => {
    switch (account.type) {
      case 'main':
        return <Wallet size={32} color={COLORS.maroon} />;
      case 'savings':
        return <Save size={32} color={COLORS.gold} />;
      case 'credit':
        return <CreditCard size={32} color={COLORS.blue} />;
      default:
        return <Wallet size={32} color={COLORS.black} />;
    }
  };

  if (!visible) return null;

  const header = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.accountIconContainer}>
          {getAccountTypeIcon()}
        </View>
        <View>
          <Text style={styles.accountName}>{account.nickname}</Text>
          <Text style={styles.bankName}>{account.bank}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={24} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Account details and transaction history
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <FormSheet header={header} footer={footer}>
        {/* Account Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatMoney(account.balance, DEFAULT_CURRENCY)}
          </Text>
        </View>

        {/* Account Stats */}
        <View style={styles.statsContainer}>
          <BrutalCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <DollarSign size={20} color={COLORS.maroon} />
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <Text style={styles.statValue}>
              {formatMoney(totalSpent, DEFAULT_CURRENCY)}
            </Text>
          </BrutalCard>

          <BrutalCard style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar size={20} color={COLORS.blue} />
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <Text style={styles.statValue}>
              {formatMoney(monthlySpent, DEFAULT_CURRENCY)}
            </Text>
          </BrutalCard>
        </View>

        {/* Spending Trend */}
        <BrutalCard style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <BarChart3 size={20} color={COLORS.darkGray} />
            <Text style={styles.trendLabel}>Spending Trend</Text>
          </View>
          <View style={styles.trendContent}>
            {spendingTrend > 0 ? (
              <TrendingUp size={24} color={COLORS.error} />
            ) : (
              <TrendingDown size={24} color={COLORS.success} />
            )}
            <Text style={[
              styles.trendValue,
              { color: spendingTrend > 0 ? COLORS.error : COLORS.success }
            ]}>
              {spendingTrend > 0 ? '+' : ''}{spendingTrend.toFixed(1)}%
            </Text>
            <Text style={styles.trendDescription}>
              vs last month
            </Text>
          </View>
        </BrutalCard>

        {/* Transaction History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Transactions</Text>
          <TransactionHistory 
            expenses={accountExpenses.slice(0, 10)} 
            showAccount={false}
          />
        </View>
      </FormSheet>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  bankName: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  closeButton: {
    padding: 5,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  trendCard: {
    padding: 16,
    marginBottom: 24,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
});

export default AccountDetailsModal;
