import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SHADOWS } from '@/constants/colors';
import { FormInput } from './FormInput';
import BrutalButton from './BrutalButton';
import { useLanguage } from '@/hooks/useLanguageStore';
import { trpc } from '@/lib/trpc';
import { X, Building, CreditCard, Wallet } from 'lucide-react-native';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

const QATARI_BANKS = [
  'QNB - Qatar National Bank',
  'CBQ - Commercial Bank of Qatar',
  'QIB - Qatar Islamic Bank',
  'Doha Bank',
  'ADCB - Abu Dhabi Commercial Bank',
  'FAB - First Abu Dhabi Bank',
  'HSBC Qatar',
  'Standard Chartered Qatar',
  'Other',
];

const ACCOUNT_TYPES = [
  { label: 'Current Account', value: 'main' },
  { label: 'Savings Account', value: 'savings' },
  { label: 'Credit Card', value: 'credit' },
  { label: 'Mobile Wallet', value: 'wallet' },
  { label: 'Cash', value: 'cash' },
];

export default function AddAccountModal({
  visible,
  onClose,
  onAccountAdded,
}: AddAccountModalProps) {
  const { t } = useLanguage();
  const createAccount = trpc.accounts.create.useMutation();
  
  const [formData, setFormData] = useState({
    bank: '',
    type: 'main',
    nickname: '',
    balance: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank.trim()) {
      newErrors.bank = 'Bank is required';
    }
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Account nickname is required';
    }
    if (!formData.balance.trim() || isNaN(parseFloat(formData.balance))) {
      newErrors.balance = 'Valid balance is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createAccount.mutateAsync({
        bank: formData.bank,
        type: formData.type as 'main' | 'savings' | 'credit',
        nickname: formData.nickname,
        balance: parseFloat(formData.balance),
        isPrimary: false,
      });

      Alert.alert('Success', 'Account added successfully');
      onAccountAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding account:', error);
      Alert.alert('Error', 'Failed to add account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bank: '',
      type: 'main',
      nickname: '',
      balance: '',
    });
    setErrors({});
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Wallet size={20} color={COLORS.gold} />;
      case 'credit':
        return <CreditCard size={20} color={COLORS.blue} />;
      default:
        return <Building size={20} color={COLORS.maroon} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Account</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Bank"
            value={formData.bank}
            onChangeText={(text: string) => updateForm('bank', text)}
            placeholder="Select your bank"
            error={errors.bank}
            icon={Building}
            picker
            pickerItems={QATARI_BANKS.map(bank => ({ label: bank, value: bank }))}
          />

          <FormInput
            label="Account Type"
            value={formData.type}
            onChangeText={(text: string) => updateForm('type', text)}
            placeholder="Select account type"
            error={errors.type}
            leftIcon={getAccountTypeIcon(formData.type)}
            picker
            pickerItems={ACCOUNT_TYPES}
          />

          <FormInput
            label="Account Nickname"
            value={formData.nickname}
            onChangeText={(text: string) => updateForm('nickname', text)}
            placeholder="e.g., Main Account, Savings for Car"
            error={errors.nickname}
            icon={Wallet}
          />

          <FormInput
            label="Current Balance (QAR)"
            value={formData.balance}
            onChangeText={(text: string) => updateForm('balance', text.replace(/[^0-9.-]/g, ''))}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.balance}
            icon={CreditCard}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Account Information</Text>
            <Text style={styles.infoText}>
              • Your account nickname helps you identify it easily{'\n'}
              • Current balance is used for accurate net worth tracking{'\n'}
              • You can update these details anytime in settings
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <BrutalButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <BrutalButton
            title="Save Account"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  infoBox: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: COLORS.black,
    gap: 15,
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});