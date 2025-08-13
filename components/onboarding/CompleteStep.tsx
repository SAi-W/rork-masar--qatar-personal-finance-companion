import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { CheckCircle, TrendingUp, Shield, Zap, Star } from 'lucide-react-native';

interface CompleteStepProps {
  onFinish: () => void;
}

export default function CompleteStep({ onFinish }: CompleteStepProps) {
  const { t, isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.successIcon}>
          <CheckCircle size={80} color={COLORS.green} />
        </View>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          Welcome to Masar! 🎉
        </Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          Your personal finance journey starts now
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          What's Next?
        </Text>
        
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <TrendingUp size={24} color={COLORS.maroon} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Track Your Spending</Text>
              <Text style={styles.tipDescription}>
                Add expenses to see where your money goes and identify saving opportunities
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Shield size={24} color={COLORS.maroon} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Monitor Subscriptions</Text>
              <Text style={styles.tipDescription}>
                Keep track of recurring payments and never miss a bill
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <Zap size={24} color={COLORS.maroon} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Get AI Insights</Text>
              <Text style={styles.tipDescription}>
                Chat with your AI coach for personalized financial advice
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.celebration}>
          <Star size={24} color={COLORS.gold} style={styles.starIcon} />
          <Text style={[styles.celebrationText, isRTL && styles.rtlText]}>
            You're all set to take control of your finances!
          </Text>
          <Text style={[styles.celebrationSubtext, isRTL && styles.rtlText]}>
            Click "FINISH SETUP" to complete your onboarding and start using Masar
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
  successIcon: {
    marginBottom: 20,
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
  tipsContainer: {
    marginBottom: 30,
  },
  tipItem: {
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
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightMaroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  celebration: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightGreen,
    borderRadius: 12,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.green,
    textAlign: 'center',
  },
  celebrationSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  starIcon: {
    marginBottom: 15,
  },
  rtlText: {
    textAlign: 'right',
  },
});
