import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';
import { SocialButton } from '@/components/SocialButton';
import { COLORS } from '@/constants/colors';
import { User, DollarSign, Calendar, Settings } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuthStore';

interface OnboardingData {
  fullName: string;
  salary: string;
  salaryDate: string;
  autoAddSalary: boolean;
  currency: string;
  language: string;
}

export default function SetupScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    salary: '',
    salaryDate: '1',
    autoAddSalary: true,
    currency: 'QAR',
    language: 'en',
  });

  const [errors, setErrors] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'Personal Information',
      subtitle: 'Tell us about yourself',
      icon: <User size={24} color={COLORS.primary} />,
    },
    {
      title: 'Financial Setup',
      subtitle: 'Set up your income details',
      icon: <DollarSign size={24} color={COLORS.primary} />,
    },
    {
      title: 'Preferences',
      subtitle: 'Customize your experience',
      icon: <Settings size={24} color={COLORS.primary} />,
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<OnboardingData> = {};

    switch (step) {
      case 0:
        if (!data.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        break;
      case 1:
        if (!data.salary.trim()) {
          newErrors.salary = 'Salary is required';
        } else if (isNaN(Number(data.salary)) || Number(data.salary) < 0) {
          newErrors.salary = 'Please enter a valid salary amount';
        }
        if (!data.salaryDate.trim()) {
          newErrors.salaryDate = 'Salary date is required';
        }
        break;
      case 2:
        // No validation needed for preferences
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update user data with onboarding info
      await updateUser({
        salary: Number(data.salary),
        salaryDate: Number(data.salaryDate),
        autoAddSalary: data.autoAddSalary,
        lang: data.language as 'en' | 'ar',
      });
      
      console.log('Onboarding completed:', data);
      
      // Navigate to main app
      router.replace('/(tabs)/dashboard' as any);
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={data.fullName}
              onChangeText={(text) => setData({ ...data, fullName: text })}
              error={errors.fullName}
              autoCapitalize="words"
              leftIcon={<User size={20} color={COLORS.gray} />}
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <FormInput
              label="Monthly Salary (QAR)"
              placeholder="Enter your monthly salary in QAR"
              value={data.salary}
              onChangeText={(text) => setData({ ...data, salary: text })}
              error={errors.salary}
              keyboardType="numeric"
              leftIcon={<DollarSign size={20} color={COLORS.gray} />}
            />
            
            <FormInput
              label="Salary Date (Day of Month)"
              placeholder="Select day (1–28)"
              value={data.salaryDate}
              onChangeText={(text) => setData({ ...data, salaryDate: text })}
              picker
              pickerItems={[...Array(28)].map((_, i) => ({ label: `${i+1}`, value: i+1 }))}
              onValueChange={(day: number) => setData({ ...data, salaryDate: String(day) })}
              error={errors.salaryDate}
              leftIcon={<Calendar size={20} color={COLORS.gray} />}
            />

            <View style={styles.checkboxContainer}>
              <SocialButton
                title={data.autoAddSalary ? 'Auto-add salary: ON' : 'Auto-add salary: OFF'}
                onPress={() => setData({ ...data, autoAddSalary: !data.autoAddSalary })}
                variant={data.autoAddSalary ? 'primary' : 'outline'}
              />
              <Text style={styles.checkboxDescription}>
                Automatically add your salary to your primary account each month
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Currency</Text>
              <View style={styles.preferenceOptions}>
                {['QAR', 'USD', 'EUR', 'GBP'].map((currency) => (
                  <SocialButton
                    key={currency}
                    title={currency}
                    onPress={() => setData({ ...data, currency })}
                    variant={data.currency === currency ? 'primary' : 'outline'}
                  />
                ))}
              </View>
            </View>

            <View style={styles.preferenceGroup}>
              <Text style={styles.preferenceLabel}>Language</Text>
              <View style={styles.preferenceOptions}>
                <SocialButton
                  title="English"
                  onPress={() => setData({ ...data, language: 'en' })}
                  variant={data.language === 'en' ? 'primary' : 'outline'}
                />
                <SocialButton
                  title="العربية"
                  onPress={() => setData({ ...data, language: 'ar' })}
                  variant={data.language === 'ar' ? 'primary' : 'outline'}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.stepHeader}>
          {steps[currentStep].icon}
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <SocialButton
              title="Back"
              onPress={handleBack}
              variant="outline"
            />
          )}
          <SocialButton
            title={currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            onPress={handleNext}
            variant="primary"
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepHeader: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  stepContent: {
    paddingBottom: 32,
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkboxDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  preferenceGroup: {
    marginBottom: 32,
  },
  preferenceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  preferenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});