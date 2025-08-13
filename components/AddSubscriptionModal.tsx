import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FormInput } from './FormInput';
import BrutalButton from './BrutalButton';
import FormSheet from './ui/FormSheet';
import Select from './ui/Select';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { formatMoney, parseMoneyToMinor, DEFAULT_CURRENCY } from '@/utils/currency';
import { X, Calendar, CreditCard, Bell, Repeat } from 'lucide-react-native';

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscriptionAdded: () => void;
  subscription?: any; // For editing existing subscription
}

const BILLING_CYCLES = [
  'monthly',
  'quarterly',
  'yearly',
  'weekly',
  'bi-weekly',
];

const CATEGORIES = [
  'entertainment',
  'utilities',
  'health',
  'education',
  'shopping',
  'food',
  'transport',
  'other',
];

const STATUS_OPTIONS = [
  'active',
  'paused',
  'canceled',
];

export default function AddSubscriptionModal({
  visible,
  onClose,
  onSubscriptionAdded,
  subscription,
}: AddSubscriptionModalProps) {
  const { t } = useLanguage();
  const { accounts, fetchAccounts } = useFinanceStore();
  const createSubscription = trpc.subscriptions.create.useMutation();
  const updateSubscription = trpc.subscriptions.update.useMutation();
  
  const [formData, setFormData] = useState({
    serviceName: '',
    amount: '',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'weekly' | 'bi-weekly',
    nextBillingDate: new Date().toISOString().split('T')[0],
    category: 'other' as 'food' | 'transportation' | 'housing' | 'utilities' | 'entertainment' | 'shopping' | 'health' | 'education' | 'travel' | 'other',
    status: 'active' as 'active' | 'canceled' | 'paused',
    autoDeduct: true,
    reminderDays: 3,
    accountId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAccounts();
      if (subscription) {
        // Editing mode - populate form with existing data
        setFormData({
          serviceName: subscription.serviceName || '',
          amount: subscription.amount ? formatMoneyInput(subscription.amount) : '',
          billingCycle: (subscription.billingCycle || 'monthly') as 'monthly' | 'quarterly' | 'yearly' | 'weekly' | 'bi-weekly',
          nextBillingDate: subscription.nextBillingDate || new Date().toISOString().split('T')[0],
          category: (subscription.category || 'other') as 'food' | 'transportation' | 'housing' | 'utilities' | 'entertainment' | 'shopping' | 'health' | 'education' | 'travel' | 'other',
          status: (subscription.status || 'active') as 'active' | 'canceled' | 'paused',
          autoDeduct: subscription.autoDeduct !== false,
          reminderDays: subscription.reminderDays || 3,
          accountId: subscription.accountId || '',
        });
      } else {
        // New subscription mode
        if (accounts.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
        }
      }
    }
  }, [visible, accounts, subscription]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }
    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
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
      
      if (subscription) {
        // Update existing subscription
        await updateSubscription.mutateAsync({
          id: subscription.id,
          serviceName: formData.serviceName.trim(),
          amount: amountMinor,
          billingCycle: formData.billingCycle,
          nextBillingDate: formData.nextBillingDate,
          category: formData.category,
          status: formData.status,
          autoDeduct: formData.autoDeduct,
          reminderDays: formData.reminderDays,
          accountId: formData.accountId,
        });
        Alert.alert('Success', 'Subscription updated successfully!');
      } else {
        // Create new subscription
        await createSubscription.mutateAsync({
          serviceName: formData.serviceName.trim(),
          amount: amountMinor,
          billingCycle: formData.billingCycle,
          nextBillingDate: formData.nextBillingDate,
          category: formData.category,
          status: formData.status,
          autoDeduct: formData.autoDeduct,
          reminderDays: formData.reminderDays,
          accountId: formData.accountId,
        });
        Alert.alert('Success', 'Subscription added successfully!');
      }

      resetForm();
      onSubscriptionAdded();
      onClose();
    } catch (error) {
      console.error('Error saving subscription:', error);
      Alert.alert('Error', 'Failed to save subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      amount: '',
      billingCycle: 'monthly',
      nextBillingDate: new Date().toISOString().split('T')[0],
      category: 'other',
      status: 'active',
      autoDeduct: true,
      reminderDays: 3,
      accountId: accounts.length > 0 ? accounts[0].id : '',
    });
    setErrors({});
  };

  const updateForm = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateNextBillingDate = (currentDate: string, cycle: string): string => {
    const date = new Date(currentDate);
    switch (cycle) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'bi-weekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const billingCycleOptions = BILLING_CYCLES.map(cycle => ({ 
    label: cycle.charAt(0).toUpperCase() + cycle.slice(1), 
    value: cycle 
  }));

  const categoryOptions = CATEGORIES.map(cat => ({ 
    label: cat.charAt(0).toUpperCase() + cat.slice(1), 
    value: cat 
  }));

  const statusOptions = STATUS_OPTIONS.map(status => ({ 
    label: status.charAt(0).toUpperCase() + status.slice(1), 
    value: status 
  }));

  const accountOptions = accounts.map(acc => ({ 
    label: `${acc.nickname} (${acc.bank}) - ${formatMoney(acc.balance, DEFAULT_CURRENCY)}`, 
    value: acc.id 
  }));

  if (!visible) return null;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>
        {subscription ? 'Edit Subscription' : 'Add New Subscription'}
      </Text>
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
        title={subscription ? 'Update Subscription' : 'Save Subscription'}
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
          label="Service Name"
          value={formData.serviceName}
          onChangeText={(text: string) => updateForm('serviceName', text)}
          placeholder="e.g., Netflix, Spotify"
          error={errors.serviceName}
          icon={Bell}
        />

        <FormInput
          label="Amount"
          value={formData.amount}
          onChangeText={(text: string) => updateForm('amount', text)}
          placeholder="0.00"
          error={errors.amount}
          icon={CreditCard}
          keyboardType="decimal-pad"
        />

        <Select
          label="Billing Cycle"
          value={formData.billingCycle}
          options={billingCycleOptions}
          onChange={(value: string) => updateForm('billingCycle', value)}
          placeholder="Select billing cycle"
        />

        <FormInput
          label="Next Billing Date"
          value={formData.nextBillingDate}
          onChangeText={(text: string) => updateForm('nextBillingDate', text)}
          placeholder="YYYY-MM-DD"
          error={errors.nextBillingDate}
          icon={Calendar}
        />

        <Select
          label="Category"
          value={formData.category}
          options={categoryOptions}
          onChange={(value: string) => updateForm('category', value)}
          placeholder="Select category"
        />

        <Select
          label="Status"
          value={formData.status}
          options={statusOptions}
          onChange={(value: string) => updateForm('status', value)}
          placeholder="Select status"
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
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Auto-Deduct</Text>
            <Switch
              value={formData.autoDeduct}
              onValueChange={(value) => updateForm('autoDeduct', value)}
              trackColor={{ false: COLORS.border, true: COLORS.maroon }}
              thumbColor={COLORS.white}
            />
          </View>
          <Text style={styles.toggleDescription}>
            Automatically deduct from account on billing date
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Reminder</Text>
            <Switch
              value={formData.reminderDays > 0}
              onValueChange={(value) => updateForm('reminderDays', value ? 3 : 0)}
              trackColor={{ false: COLORS.border, true: COLORS.maroon }}
              thumbColor={COLORS.white}
            />
          </View>
          <Text style={styles.toggleDescription}>
            Get notified {formData.reminderDays} days before billing
          </Text>
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
    padding: 15,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  toggleDescription: {
    fontSize: 14,
    color: COLORS.placeholder,
    lineHeight: 20,
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
