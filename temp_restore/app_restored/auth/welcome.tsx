import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { Mail, User, Chrome } from 'lucide-react-native';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import Logo from '@/components/Logo';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useAuth } from '@/hooks/useAuthStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();

  const handleEmailSignUp = () => {
    router.push('/auth/signup?method=email');
  };

  const handleGoogleSignUp = async () => {
    try {
      // TODO: Implement actual Google OAuth
      // For now, we'll simulate a successful Google authentication
      console.log('Signing up with Google...');
      
      // Simulate Google OAuth response
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        full_name: 'Google User',
        email: 'user@gmail.com',
        lang: 'en' as const,
        salary: 0,
        salaryDate: 1,
        autoAddSalary: false,
        side_income: 0,
        onboarding_completed: false,
      };
      
      const mockToken = 'google_token_' + Date.now();
      
      // Login the user
      await login(mockGoogleUser, mockToken);
      
      // Redirect to onboarding
      router.push('/auth/onboarding');
    } catch (error) {
      console.error('Google sign up error:', error);
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.');
    }
  };

  const handleSocialSignUp = (provider: string) => {
    if (provider === 'google') {
      handleGoogleSignUp();
    } else {
      console.log(`Sign up with ${provider}`);
      // TODO: Implement other social authentication
    }
  };

  const goToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo size={100} />
          </View>
          <Text style={[styles.title, isRTL && styles.rtlText]}>{t.welcomeToMasar}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t.personalFinanceCompanion}</Text>
        </View>

        <View style={styles.content}>
          <BrutalCard style={styles.buttonsCard}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t.getStarted}</Text>
            
            <View style={styles.buttonWithIcon}>
              <Chrome size={20} color={COLORS.black} style={styles.buttonIcon} />
              <BrutalButton
                title="Continue with Google"
                onPress={() => handleSocialSignUp('google')}
                variant="primary"
                style={styles.googleButton}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.or}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.buttonWithIcon}>
              <Mail size={20} color={COLORS.black} style={styles.buttonIcon} />
              <BrutalButton
                title={t.continueWithEmail}
                onPress={handleEmailSignUp}
                variant="outline"
                style={styles.signUpButton}
              />
            </View>

            <View style={styles.termsContainer}>
              <Text style={[styles.termsText, isRTL && styles.rtlText]}>
                {t.termsAndPrivacy}
              </Text>
            </View>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, isRTL && styles.rtlText]}>{t.alreadyHaveAccount}</Text>
              <BrutalButton
                title={t.signIn}
                onPress={goToLogin}
                variant="secondary"
                style={styles.loginButton}
              />
            </View>
          </BrutalCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: COLORS.maroon,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'center',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  buttonsCard: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  buttonWithIcon: {
    position: 'relative',
    marginBottom: 20,
  },
  buttonIcon: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -10,
    zIndex: 10,
  },
  signUpButton: {
    paddingLeft: 56,
  },
  googleButton: {
    paddingLeft: 56,
  },
  socialButton: {
    paddingLeft: 56,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.black,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  termsContainer: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
    paddingHorizontal: 16,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  loginButton: {
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});