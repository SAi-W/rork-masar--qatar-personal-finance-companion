import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';

import { COLORS } from '@/constants/colors';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuthStore';
import { useLanguage } from '@/hooks/useLanguageStore';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import Logo from '@/components/Logo';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  
  const loginMutation = trpc.auth.login.useMutation();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validEmail;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login successful:', result);
      
      // Save auth data and navigate
      await login(result.user, result.token);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.message) {
        if (
          error.message.includes('Network request failed') ||
          error.message.includes('Network error') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('timeout') ||
          error.message.includes('Unable to connect') ||
          error.message.includes('Request timed out') ||
          error.name === 'AbortError'
        ) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('Invalid credentials') || error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    router.push('/auth/welcome');
  };

  const goBack = () => {
    router.back();
  };

  const handleForgotPassword = () => {
    console.log('Forgot password');
    // TODO: Implement forgot password
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <View style={styles.backButtonContainer}>
          <BrutalButton
            title=""
            onPress={goBack}
            variant="outline"
            size="small"
            style={styles.backButton}
          />
          <ArrowLeft size={20} color={COLORS.black} style={styles.backIcon} />
        </View>
        <View style={styles.logoContainer}>
          <Logo size={80} />
        </View>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t.welcomeBack}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t.signInToAccount}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BrutalCard style={styles.formCard}>
          <FormInput
            label={t.emailAddress}
            placeholder={t.enterEmail}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={COLORS.black} />}
          />

          <FormInput
            label={t.password}
            placeholder={t.enterPassword}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            error={errors.password}
            secureTextEntry
            leftIcon={<Lock size={20} color={COLORS.black} />}
          />

          <BrutalButton
            title={t.forgotPassword}
            onPress={handleForgotPassword}
            variant="outline"
            size="small"
            style={styles.forgotButton}
          />

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <BrutalButton
            title={loading ? 'SIGNING IN...' : t.signIn}
            onPress={handleLogin}
            variant="primary"
            disabled={loading}
            style={styles.signInButton}
          />

          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, isRTL && styles.rtlText]}>{t.dontHaveAccount}</Text>
            <BrutalButton
              title={t.createAccount}
              onPress={goToSignUp}
              variant="secondary"
              style={styles.createAccountButton}
            />
          </View>
        </BrutalCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
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
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    padding: 0,
  },
  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  logoContainer: {
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  formCard: {
    marginBottom: 32,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    borderWidth: 4,
    borderColor: COLORS.black,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  signInButton: {
    marginBottom: 24,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    color: COLORS.black,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  createAccountButton: {
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});