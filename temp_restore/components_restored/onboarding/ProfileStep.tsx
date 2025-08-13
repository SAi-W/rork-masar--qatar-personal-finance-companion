import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { FormInput } from '@/components/FormInput';
import { User, DollarSign, Briefcase } from 'lucide-react-native';

interface ProfileStepProps {
  data: {
    fullName: string;
    monthlySalary: string;
    averageSideIncome: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function ProfileStep({ data, onChange, errors }: ProfileStepProps) {
  const { t, isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          Tell Us About Yourself
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          This helps us personalize your financial insights and recommendations
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formSection}>
          <FormInput
            label="Full Name"
            placeholder="Enter your full name"
            value={data.fullName}
            onChangeText={(text) => onChange('fullName', text)}
            leftIcon={<User size={20} color={COLORS.gray} />}
            error={errors.fullName}
            autoCapitalize="words"
          />

          <FormInput
            label="Monthly Salary (QAR)"
            placeholder="Enter your monthly salary in QAR"
            value={data.monthlySalary}
            onChangeText={(text) => onChange('monthlySalary', text)}
            keyboardType="numeric"
            leftIcon={<DollarSign size={20} color={COLORS.gray} />}
            error={errors.monthlySalary}
          />

          <FormInput
            label="Average Side Income (QAR)"
            placeholder="Enter your average monthly side income in QAR"
            value={data.averageSideIncome}
            onChangeText={(text) => onChange('averageSideIncome', text)}
            keyboardType="numeric"
            leftIcon={<Briefcase size={20} color={COLORS.gray} />}
            error={errors.averageSideIncome}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, isRTL && styles.rtlText]}>
            Why We Ask This
          </Text>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            Your income information helps us provide more accurate spending insights, 
            budget recommendations, and financial planning advice tailored to your situation.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  formSection: {
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: COLORS.lightBlue,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.maroon,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
  },
});
