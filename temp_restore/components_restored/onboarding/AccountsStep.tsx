import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { useLanguage } from '@/hooks/useLanguageStore';
import { FormInput } from '@/components/FormInput';
import BrutalButton from '@/components/BrutalButton';
import { CreditCard, Plus, Trash2, ChevronDown } from 'lucide-react-native';

interface Account {
  id: string;
  bank: string;
  accountType: string;
  nickname: string;
  balance: string;
}

interface AccountsStepProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onRemoveAccount: (id: string) => void;
  onUpdateAccount: (id: string, field: string, value: string) => void;
}

export default function AccountsStep({ 
  accounts, 
  onAddAccount, 
  onRemoveAccount, 
  onUpdateAccount 
}: AccountsStepProps) {
  const { t, isRTL } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAccountTypeDropdown, setShowAccountTypeDropdown] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank: '',
    accountType: '',
    nickname: '',
    balance: '',
  });

  const accountTypes = [
    { value: 'main', label: 'Main Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'business', label: 'Business Account' },
  ];

  const handleAddAccount = () => {
    if (!newAccount.bank.trim()) {
      Alert.alert('Error', 'Please enter a bank name');
      return;
    }
    if (!newAccount.accountType.trim()) {
      Alert.alert('Error', 'Please select an account type');
      return;
    }
    if (!newAccount.nickname.trim()) {
      Alert.alert('Error', 'Please enter an account nickname');
      return;
    }
    if (!newAccount.balance.trim() || isNaN(parseFloat(newAccount.balance))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    onAddAccount(newAccount);
    setNewAccount({ bank: '', accountType: '', nickname: '', balance: '' });
    setShowAddForm(false);
  };

  const selectAccountType = (type: string) => {
    setNewAccount({ ...newAccount, accountType: type });
    setShowAccountTypeDropdown(false);
  };

  const renderAccountForm = () => (
    <View style={styles.accountForm}>
      <FormInput
        label="Bank Name"
        placeholder="Enter your bank name"
        value={newAccount.bank}
        onChangeText={(text) => setNewAccount({ ...newAccount, bank: text })}
        leftIcon={<CreditCard size={20} color={COLORS.gray} />}
      />

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Account Type</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowAccountTypeDropdown(!showAccountTypeDropdown)}
        >
          <Text style={[
            styles.dropdownButtonText,
            !newAccount.accountType && styles.placeholderText
          ]}>
            {newAccount.accountType 
              ? accountTypes.find(t => t.value === newAccount.accountType)?.label 
              : 'Select account type'
            }
          </Text>
          <ChevronDown size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        {showAccountTypeDropdown && (
          <ScrollView style={styles.dropdownOptions} nestedScrollEnabled={true}>
            {accountTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.dropdownOption}
                onPress={() => selectAccountType(type.value)}
              >
                <Text style={styles.dropdownOptionText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FormInput
        label="Account Nickname"
        placeholder="Enter a nickname for this account"
        value={newAccount.nickname}
        onChangeText={(text) => setNewAccount({ ...newAccount, nickname: text })}
        leftIcon={<CreditCard size={20} color={COLORS.gray} />}
      />

      <FormInput
        label="Current Balance (QAR)"
        placeholder="Enter your current balance in QAR"
        value={newAccount.balance}
        onChangeText={(text) => setNewAccount({ ...newAccount, balance: text })}
        keyboardType="numeric"
        leftIcon={<CreditCard size={20} color={COLORS.gray} />}
      />

      <View style={styles.formButtons}>
        <BrutalButton
          title="Cancel"
          onPress={() => setShowAddForm(false)}
          variant="outline"
        />
        <BrutalButton
          title="Add Account"
          onPress={handleAddAccount}
          variant="primary"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          Set Up Your Accounts
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          Add your financial accounts to track your balances and spending
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {accounts.length > 0 && (
          <View style={styles.accountsList}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              Your Accounts
            </Text>
            {accounts.map((account, index) => (
              <View key={account.id} style={styles.accountItem}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.nickname}</Text>
                  <Text style={styles.accountDetails}>
                    {account.bank} • {accountTypes.find(t => t.value === account.accountType)?.label || account.accountType}
                  </Text>
                  <Text style={styles.accountBalance}>
                    Balance: {formatCurrency(parseFloat(account.balance))}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveAccount(account.id)}
                  style={styles.removeButton}
                >
                  <Trash2 size={20} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showAddForm ? (
          renderAccountForm()
        ) : (
          <View style={styles.addAccountSection}>
            <View style={styles.addButtonContainer}>
              <Plus size={20} color={COLORS.maroon} style={styles.addButtonIcon} />
              <BrutalButton
                title="Add Account"
                onPress={() => setShowAddForm(true)}
                variant="outline"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {accounts.length === 0 && !showAddForm && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isRTL && styles.rtlText]}>
            No accounts yet
          </Text>
          <Text style={[styles.emptySubtext, isRTL && styles.rtlText]}>
            Add your first account to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  accountsList: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  accountDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.maroon,
  },
  removeButton: {
    padding: 8,
  },
  addAccountSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  accountForm: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: COLORS.gray,
  },
  dropdownOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButtonIcon: {
    marginLeft: -8, // Adjust as needed to align with button text
  },
});
