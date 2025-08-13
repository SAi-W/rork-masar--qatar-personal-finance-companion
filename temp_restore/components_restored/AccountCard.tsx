import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Account, Expense } from '@/types';
import BrutalCard from './BrutalCard';
import { COLORS } from '@/constants/colors';
import { accountTypeLabels } from '@/mocks/data';
import { formatCurrency } from '@/utils/formatters';
import { Wallet, Save, CreditCard, Calendar, DollarSign } from 'lucide-react-native';

interface AccountCardProps {
  account: Account;
  expenses?: Expense[];
}

const AccountCard: React.FC<AccountCardProps> = ({ account, expenses = [] }) => {
  // Calculate account insights
  const accountExpenses = expenses.filter(expense => expense.accountId === account.id);
  
  const monthlyExpenses = accountExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return expenseDate >= thirtyDaysAgo;
  });
  
  const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <BrutalCard 
      style={styles.card} 
      testID={`account-card-${account.id}`}
    >
      <View style={styles.header}>
        <View style={styles.bankInfo}>
          <View style={styles.accountIconContainer}>
            {account.type === 'main' && <Wallet size={24} color={COLORS.text} />}
            {account.type === 'savings' && <Save size={24} color={COLORS.text} />}
            {account.type === 'credit' && <CreditCard size={24} color={COLORS.text} />}
          </View>
          <View>
            <Text style={styles.nickname}>{account.nickname}</Text>
            <Text style={styles.bankName}>{account.bank}</Text>
          </View>
        </View>
        {account.isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>PRIMARY</Text>
          </View>
        )}
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>BALANCE</Text>
        <Text 
          style={[
            styles.balanceAmount, 
            account.balance < 0 && styles.negativeBalance
          ]}
        >
          {formatCurrency(account.balance)}
        </Text>
      </View>

      {/* Account Insights */}
      <View style={styles.insightsContainer}>
        <View style={styles.insightRow}>
          <View style={styles.insightItem}>
            <DollarSign size={16} color={COLORS.textSecondary} />
            <Text style={styles.insightLabel}>Monthly</Text>
            <Text style={styles.insightValue}>{formatCurrency(monthlySpent)}</Text>
          </View>
          <View style={styles.insightItem}>
            <Calendar size={16} color={COLORS.textSecondary} />
            <Text style={styles.insightLabel}>Transactions</Text>
            <Text style={styles.insightValue}>{monthlyExpenses.length}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.accountTypeContainer}>
          {account.type === 'main' && <Wallet size={16} color={COLORS.textSecondary} />}
          {account.type === 'savings' && <Save size={16} color={COLORS.textSecondary} />}
          {account.type === 'credit' && <CreditCard size={16} color={COLORS.textSecondary} />}
          <Text style={styles.accountType}>{accountTypeLabels[account.type]?.toUpperCase()}</Text>
        </View>
      </View>
    </BrutalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderWidth: 4,
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  bankName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  primaryBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  negativeBalance: {
    color: COLORS.error,
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightItem: {
    alignItems: 'center',
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
});

export default AccountCard;