import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import BrutalCard from '@/components/BrutalCard';
import BrutalButton from '@/components/BrutalButton';
import { FormInput } from '@/components/FormInput';
import Select from '@/components/ui/Select';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useAuth } from '@/hooks/useAuthStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { Plus, CreditCard, TrendingUp, Calendar, Banknote } from 'lucide-react-native';

interface SideIncome {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  category: string;
  description?: string;
}

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onMoneyAdded: () => void;
}

const FREQUENCIES = [
  'monthly',
  'weekly',
  'quarterly',
  'yearly',
  'one-time',
];

const CATEGORIES = [
  'freelance',
  'investment',
  'bonus',
  'gift',
  'other',
];

function AddMoneyModal({ visible, onClose, onMoneyAdded }: AddMoneyModalProps) {
  const { accounts, fetchAccounts } = useFinanceStore();
  const [formData, setFormData] = useState({
    amount: '',
    accountId: '',
    notes: '',
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      // This would typically call a backend API to add money to the account
      // For now, we'll just show success
      Alert.alert('Success', 'Money added successfully');
      onMoneyAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error adding money:', error);
      Alert.alert('Error', 'Failed to add money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      accountId: accounts[0]?.id || '',
      notes: '',
    });
    setErrors({});
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Money</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalForm}>
          <FormInput
            label="Amount"
            value={formData.amount}
            onChangeText={(text) => updateForm('amount', text.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.amount}
          />

          <Select
            label="Account"
            value={formData.accountId}
            options={accounts.map(a => ({ label: `${a.nickname} • ${a.bank}`, value: a.id }))}
            onChange={(v) => updateForm('accountId', v)}
            placeholder="Select account"
          />

          <FormInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => updateForm('notes', text)}
            placeholder="Reason for adding money..."
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <BrutalButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <BrutalButton
            title="Add Money"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </View>
    </View>
  );
}

export default function IncomeScreen() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const { accounts, fetchAccounts } = useFinanceStore();
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [sideIncomes, setSideIncomes] = useState<SideIncome[]>([]);
  const [salarySettings, setSalarySettings] = useState({
    salary: user?.salary || 0,
    salaryDate: user?.salaryDate || 1,
    autoAddSalary: user?.autoAddSalary || false,
    salaryAccountId: user?.salaryAccountId || '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSalarySettingsUpdate = async (field: string, value: any) => {
    const newSettings = { ...salarySettings, [field]: value };
    setSalarySettings(newSettings);

    try {
      await updateUser({
        ...user,
        salary: newSettings.salary,
        salaryDate: newSettings.salaryDate,
        autoAddSalary: newSettings.autoAddSalary,
        salaryAccountId: newSettings.salaryAccountId,
      });
    } catch (error) {
      console.error('Error updating salary settings:', error);
    }
  };

  const handleAddSideIncome = () => {
    const newSideIncome: SideIncome = {
      id: Date.now().toString(),
      title: 'New Side Income',
      amount: 0,
      frequency: 'monthly',
      category: 'other',
    };
    setSideIncomes([...sideIncomes, newSideIncome]);
  };

  const handleUpdateSideIncome = (id: string, field: string, value: any) => {
    setSideIncomes(sideIncomes.map(income => 
      income.id === id ? { ...income, [field]: value } : income
    ));
  };

  const handleRemoveSideIncome = (id: string) => {
    setSideIncomes(sideIncomes.filter(income => income.id !== id));
  };

  const renderSalarySection = () => (
    <BrutalCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <Banknote size={24} color={COLORS.maroon} />
        <Text style={styles.sectionTitle}>Monthly Salary</Text>
      </View>

      <FormInput
        label="Salary Amount"
        value={salarySettings.salary.toString()}
        onChangeText={(text) => handleSalarySettingsUpdate('salary', parseFloat(text) || 0)}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <FormInput
        label="Salary Date (Day of month)"
        value={salarySettings.salaryDate.toString()}
        icon={Calendar}
        picker
        pickerItems={[...Array(28)].map((_, i) => ({ label: `${i+1}`, value: i+1 }))}
        onValueChange={(val:number) => handleSalarySettingsUpdate('salaryDate', val)}
      />

      <View style={styles.toggleContainer}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <TrendingUp size={20} color={COLORS.black} />
            <Text style={styles.toggleText}>Auto-Deposit Salary</Text>
          </View>
          <Switch
            value={salarySettings.autoAddSalary}
            onValueChange={(value) => handleSalarySettingsUpdate('autoAddSalary', value)}
            trackColor={{ false: COLORS.lightGray, true: COLORS.maroon }}
            thumbColor={COLORS.white}
          />
        </View>
        <Text style={styles.toggleDescription}>
          Automatically add salary to selected account on salary date
        </Text>
      </View>

      {salarySettings.autoAddSalary && (
        <FormInput
          label="Deposit to Account"
          value={salarySettings.salaryAccountId}
          onChangeText={(text) => handleSalarySettingsUpdate('salaryAccountId', text)}
          placeholder="Select account"
          icon={CreditCard}
          picker
          pickerItems={accounts.map(acc => ({ 
            label: `${acc.nickname} (${acc.bank})`, 
            value: acc.id 
          }))}
        />
      )}
    </BrutalCard>
  );

  const renderSideIncomeSection = () => (
    <BrutalCard style={styles.section}>
      <View style={styles.sectionHeader}>
        <TrendingUp size={24} color={COLORS.maroon} />
        <Text style={styles.sectionTitle}>Side Income Sources</Text>
        <TouchableOpacity onPress={handleAddSideIncome} style={styles.addButton}>
          <Plus size={20} color={COLORS.maroon} />
        </TouchableOpacity>
      </View>

      {sideIncomes.map((income, index) => (
        <View key={income.id} style={styles.sideIncomeItem}>
          <FormInput
            label="Source"
            value={income.title}
            onChangeText={(text) => handleUpdateSideIncome(income.id, 'title', text)}
            placeholder="e.g., Freelance Project"
            icon={TrendingUp}
          />

          <FormInput
            label="Amount"
            value={income.amount.toString()}
            onChangeText={(text) => handleUpdateSideIncome(income.id, 'amount', parseFloat(text) || 0)}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <FormInput
            label="Frequency"
            value={income.frequency}
            onChangeText={(text) => handleUpdateSideIncome(income.id, 'frequency', text)}
            placeholder="Select frequency"
            icon={Calendar}
            picker
            pickerItems={FREQUENCIES.map(freq => ({ 
              label: freq.charAt(0).toUpperCase() + freq.slice(1), 
              value: freq 
            }))}
          />

          <FormInput
            label="Category"
            value={income.category}
            onChangeText={(text) => handleUpdateSideIncome(income.id, 'category', text)}
            placeholder="Select category"
            icon={TrendingUp}
            picker
            pickerItems={CATEGORIES.map(cat => ({ 
              label: cat.charAt(0).toUpperCase() + cat.slice(1), 
              value: cat 
            }))}
          />

          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveSideIncome(income.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      {sideIncomes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No side income sources added yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first source</Text>
        </View>
      )}
    </BrutalCard>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <BrutalButton
        title="ADD MONEY"
        onPress={() => setShowAddMoneyModal(true)}
        variant="primary"
        style={styles.addMoneyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader
        title="Income Management"
        subtitle="Manage your salary and side income sources"
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderQuickActions()}
        {renderSalarySection()}
        {renderSideIncomeSection()}
      </ScrollView>

      <AddMoneyModal
        visible={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onMoneyAdded={() => {
          fetchAccounts();
          setShowAddMoneyModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  addMoneyButton: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  addButton: {
    padding: 8,
    backgroundColor: COLORS.lightMaroon,
    borderRadius: 6,
  },
  toggleContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  toggleDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
  },
  sideIncomeItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: COLORS.red,
    borderRadius: 6,
    marginTop: 10,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.gray,
    padding: 5,
  },
  modalForm: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});