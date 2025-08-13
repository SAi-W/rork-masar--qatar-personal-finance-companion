import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import BrutalCard from '@/components/BrutalCard';
import { Wallet, TrendingUp } from 'lucide-react-native';

interface Account {
  id: string;
  bank: string;
  type: string;
  nickname: string;
  balance: number;
}

interface AccountsOverviewProps {
  accounts: Account[];
  totalCash: number;
}

export default function AccountsOverview({ accounts, totalCash }: AccountsOverviewProps) {
  const router = useRouter();



  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings':
        return '💰';
      case 'checking':
        return '💳';
      case 'credit':
        return '💳';
      default:
        return '🏦';
    }
  };

  return (
    <BrutalCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Wallet size={20} color={COLORS.primary} />
          <Text style={styles.title}>Accounts Overview</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/accounts')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalCashContainer}>
        <Text style={styles.totalCashLabel}>Total Cash</Text>
        <Text style={styles.totalCashAmount}>{formatCurrency(totalCash)}</Text>
        <View style={styles.trendContainer}>
          <TrendingUp size={16} color={COLORS.success} />
          <Text style={styles.trendText}>+2.5% this month</Text>
        </View>
      </View>

      <View style={styles.accountsList}>
        {accounts.slice(0, 3).map((account) => (
          <View key={account.id} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountIcon}>{getAccountIcon(account.type)}</Text>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{account.nickname}</Text>
                <Text style={styles.accountBank}>{account.bank}</Text>
              </View>
            </View>
            <View style={styles.accountBalance}>
              <Text style={styles.balanceAmount}>{formatCurrency(account.balance)}</Text>
              <Text style={styles.accountType}>{account.type}</Text>
            </View>
          </View>
        ))}
      </View>

      {accounts.length > 3 && (
        <TouchableOpacity 
          style={styles.moreAccounts}
          onPress={() => router.push('/(tabs)/accounts')}
        >
          <Text style={styles.moreAccountsText}>
            +{accounts.length - 3} more accounts
          </Text>
        </TouchableOpacity>
      )}
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  totalCashContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  totalCashLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  totalCashAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  accountsList: {
    gap: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  accountBank: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  accountType: {
    fontSize: 10,
    color: COLORS.darkGray,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  moreAccounts: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  moreAccountsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
