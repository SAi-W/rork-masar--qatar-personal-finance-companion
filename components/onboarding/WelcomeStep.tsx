import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { TrendingUp, Shield, Zap, CreditCard } from 'lucide-react-native';

interface WelcomeStepProps {
  onContinue: () => void;
}

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  const { t, isRTL } = useLanguage();

  const benefits = [
    {
      icon: <TrendingUp size={24} color={COLORS.maroon} />,
      title: 'Smart Spending Tracking',
      description: 'Automatically categorize and track your expenses to see where your money goes',
    },
    {
      icon: <Shield size={24} color={COLORS.maroon} />,
      title: 'Subscription Management',
      description: 'Never miss a bill or subscription renewal with automated tracking',
    },
    {
      icon: <Zap size={24} color={COLORS.maroon} />,
      title: 'AI-Powered Insights',
      description: 'Get personalized financial advice and spending analysis from your AI coach',
    },
    {
      icon: <CreditCard size={24} color={COLORS.maroon} />,
      title: 'Multi-Account Support',
      description: 'Manage all your financial accounts in one place for complete visibility',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          Welcome to Masar! 🎯
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          Your personal finance companion for smarter money management
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          What Masar Offers
        </Text>
        
        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                {benefit.icon}
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, isRTL && styles.rtlText]}>
            Getting Started
          </Text>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            We'll help you set up your profile, connect your accounts, and get you started with tracking your finances. This will only take a few minutes!
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
