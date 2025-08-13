import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';
import { SocialButton } from '@/components/SocialButton';
import { COLORS } from '@/constants/colors';
import { User, DollarSign, CreditCard, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuthStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import AccountsStep from '@/components/onboarding/AccountsStep';
import CompleteStep from '@/components/onboarding/CompleteStep';

interface OnboardingData {
  fullName: string;
  monthlySalary: string;
  averageSideIncome: string;
}

interface Account {
  id: string;
  bank: string;
  accountType: string;
  nickname: string;
  balance: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { addAccount, addSideIncome } = useFinanceStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<OnboardingData>({
    fullName: user?.full_name || '',
    monthlySalary: '',
    averageSideIncome: '',
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: User },
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'accounts', title: 'Accounts', icon: CreditCard },
    { id: 'complete', title: 'Complete', icon: CheckCircle },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) { // Profile step
      if (!userData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!userData.monthlySalary.trim()) {
        newErrors.monthlySalary = 'Monthly salary is required';
      }
      if (!userData.averageSideIncome.trim()) {
        newErrors.averageSideIncome = 'Average side income is required';
      }
    }

    if (step === 2) { // Accounts step
      if (accounts.length === 0) {
        Alert.alert('Accounts Required', 'Please add at least one account to continue.');
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Update user profile
      if (user) {
        await updateUser({
          ...user,
          full_name: userData.fullName,
          salary: parseFloat(userData.monthlySalary),
          side_income: parseFloat(userData.averageSideIncome),
          onboarding_completed: true,
        });
      }

      // Add accounts to finance store
      for (const account of accounts) {
        await addAccount({
          bank: account.bank,
          type: account.accountType as 'main' | 'savings' | 'credit' | 'wallet' | 'cash',
          nickname: account.nickname,
          balance: parseFloat(account.balance),
          isPrimary: accounts.indexOf(account) === 0, // First account is primary
          created_by: user?.email || '',
        });
      }

      // Add side income if specified
      if (parseFloat(userData.averageSideIncome) > 0) {
        await addSideIncome({
          id: Date.now().toString(),
          source: 'Side Income',
          amount: parseFloat(userData.averageSideIncome),
          frequency: 'monthly' as const,
          date: new Date().toISOString(),
        });
      }

      // Redirect to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleAddAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const handleUpdateAccount = (id: string, field: string, value: string) => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, [field]: value } : account
    ));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onContinue={handleNext} />;
      case 1:
        return (
          <ProfileStep
            data={userData}
            onChange={(field, value) => setUserData({ ...userData, [field]: value })}
            errors={errors}
          />
        );
      case 2:
        return (
          <AccountsStep
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            onUpdateAccount={handleUpdateAccount}
          />
        );
      case 3:
        return <CompleteStep onFinish={handleFinish} />;
      default:
        return <WelcomeStep onContinue={handleNext} />;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={[
              styles.stepIcon,
              index <= currentStep ? styles.stepActive : styles.stepInactive
            ]}>
              <step.icon 
                size={20} 
                color={index <= currentStep ? COLORS.white : COLORS.gray} 
              />
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.stepTitle}>
        {steps[currentStep].title}
      </Text>
    </View>
  );

  const renderNavigation = () => {
    if (currentStep === 3) return null; // Complete step has no navigation

    return (
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <SocialButton
            title="BACK"
            onPress={handleBack}
            variant="outline"
          />
        )}
        <SocialButton
          title={currentStep === 2 ? "FINISH SETUP" : "CONTINUE"}
          onPress={currentStep === 2 ? handleFinish : handleNext}
          variant="primary"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {renderNavigation()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: COLORS.maroon,
  },
  stepInactive: {
    backgroundColor: COLORS.lightGray,
  },
  stepLine: {
    width: 60,
    height: 2,
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: COLORS.maroon,
  },
  stepLineInactive: {
    backgroundColor: COLORS.lightGray,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  backButton: {
    flex: 1,
    marginRight: 10,
  },
  continueButton: {
    flex: 2,
  },
});