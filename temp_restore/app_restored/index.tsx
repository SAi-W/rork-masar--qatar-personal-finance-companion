import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuthStore';
import { useLanguage } from '@/hooks/useLanguageStore';
import { COLORS } from '@/constants/colors';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasSeenIntro, user } = useAuth();
  const { isLoading: languageLoading } = useLanguage();

  useEffect(() => {
    console.log('📱 Index page mounted:', {
      isLoading,
      languageLoading,
      isAuthenticated,
      hasSeenIntro,
      userOnboardingCompleted: user?.onboarding_completed
    });

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⚠️ Loading timeout - forcing navigation to language selection');
      router.replace('/auth/language');
    }, 3000);

    // Wait for both auth and language to finish loading
    if (isLoading || languageLoading) {
      console.log('⏳ Still loading, waiting...');
      return () => clearTimeout(timeout);
    }

    clearTimeout(timeout);

    // Navigation logic
    if (!isAuthenticated) {
      if (!hasSeenIntro) {
        console.log('🌐 First time user - redirecting to language selection');
        router.replace('/auth/language');
      } else {
        console.log('👋 Returning user - redirecting to welcome');
        router.replace('/auth/welcome');
      }
    } else {
      if (!user?.onboarding_completed) {
        console.log('📝 User needs onboarding');
        router.replace('/auth/onboarding');
      } else {
        console.log('🏠 User authenticated - redirecting to main app');
        router.replace('/(tabs)' as any);
      }
    }
  }, [isLoading, languageLoading, isAuthenticated, hasSeenIntro, user?.onboarding_completed, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading Masar...</Text>
      <Text style={styles.subText}>Setting up your financial companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    color: COLORS.white,
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
});