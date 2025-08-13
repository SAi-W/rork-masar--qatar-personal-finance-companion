import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FormInput } from './FormInput';
import BrutalButton from './BrutalButton';
import FormSheet from './ui/FormSheet';
import Select from './ui/Select';
import DateField from './form/DateField';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { formatMoney, parseMoneyToMinor, defaultCurrency } from '@/utils/currency';
import { Category } from '@/types';
import { X, Calendar, CreditCard, Receipt } from 'lucide-react-native';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  preset?: string; // JSON string with preset data
}

const CATEGORIES = [
  'food',
  'transportation',
  'entertainment',
  'shopping',
  'health',
  'education',
  'utilities',
  'other',
] as const;

const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'Bank Transfer',
  'Digital Wallet',
  'Other',
];

export default function AddExpenseModal({
  visible,
  onClose,
  onExpenseAdded,
  preset,
}: AddExpenseModalProps) {
  const { t } = useLanguage();
  const { accounts, fetchAccounts } = useFinanceStore();
  const createExpense = trpc.expenses.create.useMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other' as Category,
    date: new Date(),
    merchant: '',
    paymentMethod: 'Card',
    isRecurring: false,
    accountId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAccounts();
      if (accounts.length > 0 && !formData.accountId) {
        setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
      }
    }
  }, [visible, accounts]);

  // Handle preset data from OCR
  useEffect(() => {
    if (preset) {
      try {
        const presetData = JSON.parse(preset);
        setFormData(prev => ({
          ...prev,
          title: presetData.merchant || '',
          merchant: presetData.merchant || '',
          amount: presetData.amountMinor ? (presetData.amountMinor / 100).toFixed(2) : '',
          date: presetData.dateISO ? new Date(presetData.dateISO) : new Date(),
          category: presetData.categoryGuess || 'other',
        }));
      } catch (error) {
        console.error('Error parsing preset data:', error);
      }
    }
  }, [preset]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.merchant.trim()) {
      newErrors.merchant = 'Merchant is required';
    }
    if (!formData.accountId) {
      newErrors.accountId = 'Please select an account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const amountMinor = parseMoneyToMinor(formData.amount);
      
      await createExpense.mutateAsync({
        title: formData.title.trim(),
        amount: amountMinor,
        category: formData.category,
        date: formData.date.toISOString().split('T')[0],
        merchant: formData.merchant.trim(),
        paymentMethod: formData.paymentMethod,
        isRecurring: formData.isRecurring,
        accountId: formData.accountId,
      });

      Alert.alert('Success', 'Expense added successfully!');
      resetForm();
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'other',
      date: new Date(),
      merchant: '',
      paymentMethod: 'Card',
      isRecurring: false,
      accountId: accounts.length > 0 ? accounts[0].id : '',
    });
    setErrors({});
  };

  const updateForm = (field: string, value: string | boolean | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const categoryOptions = CATEGORIES.map(cat => ({ 
    label: cat.charAt(0).toUpperCase() + cat.slice(1), 
    value: cat 
  }));

  const paymentMethodOptions = PAYMENT_METHODS.map(method => ({ 
    label: method, 
    value: method 
  }));

  const accountOptions = accounts.map(acc => ({ 
    label: `${acc.nickname} (${acc.bank}) - ${formatMoney(acc.balance, defaultCurrency)}`, 
    value: acc.id 
  }));

  if (!visible) return null;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Add New Expense</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={24} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <BrutalButton
        title="Cancel"
        onPress={onClose}
        variant="secondary"
        style={styles.cancelButton}
      />
      <BrutalButton
        title="Save Expense"
        onPress={handleSubmit}
        variant="primary"
        loading={loading}
        style={styles.submitButton}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <FormSheet header={header} footer={footer}>
        <FormInput
          label="Title"
          value={formData.title}
          onChangeText={(text: string) => updateForm('title', text)}
          placeholder="e.g., Groceries"
          error={errors.title}
          icon={Receipt}
        />

        <FormInput
          label="Amount"
          value={formData.amount}
          onChangeText={(text: string) => updateForm('amount', text)}
          placeholder="0.00"
          error={errors.amount}
          icon={CreditCard}
          keyboardType="numeric"
        />

        <Select
          label="Category"
          value={formData.category}
          options={categoryOptions}
          onChange={(value: string) => updateForm('category', value as any)}
          placeholder="Select category"
        />

        <DateField
          label="Date"
          value={formData.date}
          onChange={(date: Date) => updateForm('date', date)}
        />

        <FormInput
          label="Merchant"
          value={formData.merchant}
          onChangeText={(text: string) => updateForm('merchant', text)}
          placeholder="e.g., Carrefour"
          error={errors.merchant}
          icon={Receipt}
        />

        <Select
          label="Payment Method"
          value={formData.paymentMethod}
          options={paymentMethodOptions}
          onChange={(value: string) => updateForm('paymentMethod', value)}
          placeholder="Select payment method"
        />

        <Select
          label="Deduct From Account"
          value={formData.accountId}
          options={accountOptions}
          onChange={(value: string) => updateForm('accountId', value)}
          placeholder="Select account"
          error={errors.accountId}
        />

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggle,
              formData.isRecurring && styles.toggleActive
            ]}
            onPress={() => updateForm('isRecurring', !formData.isRecurring)}
          >
            <Text style={[
              styles.toggleText,
              formData.isRecurring && styles.toggleTextActive
            ]}>
              Recurring Expense
            </Text>
          </TouchableOpacity>
        </View>
      </FormSheet>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 5,
  },
  toggleContainer: {
    marginVertical: 15,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleActive: {
    borderColor: COLORS.maroon,
    backgroundColor: COLORS.lightMaroon,
  },
  toggleText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.maroon,
  },
  footer: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
