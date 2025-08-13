import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/FormInput';
import { COLORS } from '@/constants/colors';
import { Mail, User, Lock, ArrowLeft } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuthStore';
import { useLanguage } from '@/hooks/useLanguageStore';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import Logo from '@/components/Logo';
import { API } from '@/lib/api';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, isRTL, language } = useLanguage();
  // Force email sign-up until phone flow is implemented server-side
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    const testBackend = async () => {
      try {
        const url = `${API}/health`;
        console.log('[Backend Test] Testing backend connectivity to:', url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[Backend Test] Health check timeout, aborting...');
          controller.abort();
        }, 10000);

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors' as RequestMode,
          credentials: 'omit' as RequestCredentials,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('[Backend Test] Backend connectivity OK:', data);
        } else {
          const text = await response.text();
          console.warn('[Backend Test] Backend connectivity non-OK:', response.status, text);
        }
      } catch (error) {
        console.error('[Backend Test] Backend connectivity test error:', error);
        console.error('[Backend Test] Make sure the backend server is running with: npm run dev:api');
      }
    };

    testBackend();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.fullNameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validEmail;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.passwordMinLength;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      console.log('Attempting registration with:', {
        fullName: formData.fullName,
        email: formData.email,
        lang: language || 'en',
      });

      const result = await registerMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        lang: language || 'en',
      });

      console.log('Registration successful:', result);

      await login(result.user, result.token);
      router.push('/auth/onboarding');
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

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
        } else if (error.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
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

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const goBack = () => {
    router.back();
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
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t.signUpWithEmail.toUpperCase()}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t.enterEmail.toUpperCase()}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BrutalCard style={styles.formCard}>
          <FormInput
            label={t.fullName}
            placeholder={t.enterFullName}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            error={errors.fullName}
            autoCapitalize="words"
            leftIcon={<User size={20} color={COLORS.black} />}
          />

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

          <FormInput
            label={t.confirmPassword}
            placeholder={t.confirmYourPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            error={errors.confirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={COLORS.black} />}
          />

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <BrutalButton
            title={loading ? 'CREATING ACCOUNT...' : t.createAccount}
            onPress={handleSignUp}
            variant="primary"
            disabled={loading}
            style={styles.createButton}
          />

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, isRTL && styles.rtlText]}>{t.alreadyHaveAccount}</Text>
            <BrutalButton
              title={t.signIn}
              onPress={goToLogin}
              variant="secondary"
              style={styles.signInButton}
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
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
  createButton: {
    marginBottom: 24,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.black,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  signInButton: {
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});