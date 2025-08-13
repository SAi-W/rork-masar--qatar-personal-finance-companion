import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import { useLanguage } from '@/hooks/useLanguageStore';
import AccountCard from '@/components/AccountCard';
import AccountDetailsModal from '@/components/AccountDetailsModal';
import AddAccountModal from '@/components/AddAccountModal';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import { useAccounts, useExpenses } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown, CreditCard, PiggyBank, Wallet, BarChart3 } from 'lucide-react-native';
import { Account, Expense } from '@/types';

export default function AccountsScreen() {
  const { accounts, getTotalBalance, addAccount } = useAccounts();
  const { expenses } = useExpenses();
  const { t } = useLanguage();
  const createAccount = trpc.accounts.create.useMutation();
  const totalBalance = getTotalBalance();
  
  // State for modals
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Calculate account insights
  const accountInsights = useMemo(() => {
    const insights = accounts.map(account => {
      const accountExpenses = expenses.filter(expense => expense.accountId === account.id);
      const totalSpent = accountExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const monthlySpent = accountExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return expenseDate >= thirtyDaysAgo;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const balanceChange = account.balance - (account.balance + totalSpent);
      const isPositive = balanceChange >= 0;
      
      return {
        ...account,
        totalSpent,
        monthlySpent,
        balanceChange,
        isPositive,
        transactionCount: accountExpenses.length,
      };
    });

    return insights;
  }, [accounts, expenses]);

  // Get total monthly spending across all accounts
  const totalMonthlySpending = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return expenses
      .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Get spending trend (comparing to previous month)
  const spendingTrend = useMemo(() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const currentMonth = expenses
      .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const previousMonth = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= sixtyDaysAgo && expenseDate < thirtyDaysAgo;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  }, [expenses]);

  const handleAccountPress = (account: Account) => {
    setSelectedAccount(account);
    setIsDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedAccount(null);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
  };

  const renderAccountInsights = () => (
    <View style={styles.insightsContainer}>
      <View style={styles.insightsHeader}>
        <BarChart3 size={20} color={COLORS.maroon} />
        <Text style={styles.insightsTitle}>Account Insights</Text>
      </View>
      
      <View style={styles.insightsGrid}>
        <BrutalCard style={styles.insightCard}>
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Monthly Spending</Text>
            <Text style={styles.insightValue}>{formatCurrency(totalMonthlySpending)}</Text>
            <View style={styles.trendContainer}>
              {spendingTrend > 0 ? (
                <TrendingUp size={16} color={COLORS.red} />
              ) : (
                <TrendingDown size={16} color={COLORS.green} />
              )}
              <Text style={[
                styles.trendText,
                { color: spendingTrend > 0 ? COLORS.red : COLORS.green }
              ]}>
                {Math.abs(spendingTrend).toFixed(1)}% {spendingTrend > 0 ? 'increase' : 'decrease'}
              </Text>
            </View>
          </View>
        </BrutalCard>

        <BrutalCard style={styles.insightCard}>
          <View style={styles.insightContent}>
            <Text style={styles.insightLabel}>Total Accounts</Text>
            <Text style={styles.insightValue}>{accounts.length}</Text>
            <Text style={styles.insightSubtext}>
              {accounts.filter(acc => acc.balance > 0).length} with positive balance
            </Text>
          </View>
        </BrutalCard>
      </View>
    </View>
  );

  const renderAccountList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Accounts</Text>
        <Text style={styles.sectionSubtitle}>
          Total: {formatCurrency(totalBalance)}
        </Text>
      </View>
      
      {accounts.length > 0 ? (
        accountInsights.map(account => (
          <TouchableOpacity
            key={account.id}
            onPress={() => handleAccountPress(account)}
            style={styles.accountCardContainer}
          >
            <AccountCard 
              account={account} 
              expenses={expenses}
            />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.noAccounts}</Text>
          <Text style={styles.emptySubtext}>
            Add your first account to start tracking your finances
          </Text>
        </View>
      )}
    </View>
  );

  const renderAccountTypeBreakdown = () => {
    const accountTypes = {
      main: accounts.filter(acc => acc.type === 'main').length,
      savings: accounts.filter(acc => acc.type === 'savings').length,
      credit: accounts.filter(acc => acc.type === 'credit').length,
    };

    const totalAccounts = accounts.length;
    
    return (
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Account Distribution</Text>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <Wallet size={24} color={COLORS.maroon} />
            <Text style={styles.breakdownLabel}>Main</Text>
            <Text style={styles.breakdownValue}>{accountTypes.main}</Text>
            <Text style={styles.breakdownPercentage}>
              {totalAccounts > 0 ? ((accountTypes.main / totalAccounts) * 100).toFixed(0) : 0}%
            </Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <PiggyBank size={24} color={COLORS.gold} />
            <Text style={styles.breakdownLabel}>Savings</Text>
            <Text style={styles.breakdownValue}>{accountTypes.savings}</Text>
            <Text style={styles.breakdownPercentage}>
              {totalAccounts > 0 ? ((accountTypes.savings / totalAccounts) * 100).toFixed(0) : 0}%
            </Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <CreditCard size={24} color={COLORS.blue} />
            <Text style={styles.breakdownLabel}>Credit</Text>
            <Text style={styles.breakdownValue}>{accountTypes.credit}</Text>
            <Text style={styles.breakdownPercentage}>
              {totalAccounts > 0 ? ((accountTypes.credit / totalAccounts) * 100).toFixed(0) : 0}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title={t.accounts}
        subtitle={t.manageAccounts}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>{t.totalBalance}</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        </View>
        
        {renderAccountInsights()}
        {renderAccountTypeBreakdown()}
        {renderAccountList()}
        
        <View style={styles.buttonContainer}>
          <BrutalButton
            title={t.addNewAccount}
            testID="add-account-button"
            onPress={() => setIsAddModalVisible(true)}
            disabled={createAccount.isPending}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Account Details Modal */}
      <AccountDetailsModal
        account={selectedAccount}
        expenses={expenses}
        visible={isDetailsModalVisible}
        onClose={closeDetailsModal}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        visible={isAddModalVisible}
        onClose={closeAddModal}
        onAccountAdded={() => {
          // Refresh accounts list
          closeAddModal();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.black,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  insightsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  insightCard: {
    width: '48%', // Two columns
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  insightContent: {
    padding: 16,
  },
  insightLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  insightSubtext: {
    fontSize: 12,
    color: COLORS.gray,
  },
  breakdownContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
    width: '30%', // Three columns
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 4,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  accountCardContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkGray,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
});