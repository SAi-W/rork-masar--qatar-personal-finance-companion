import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Languages } from 'lucide-react-native';
import Logo from '@/components/Logo';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { Language } from '@/constants/translations';
import { saveLanguage } from '@/lib/storage';

export default function LanguageSelectionScreen() {
  const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = async (lang: Language) => {
    console.log('🌐 Language selected:', lang);
    await setLanguage(lang);
    await saveLanguage(lang);
    console.log('🎯 Redirecting to /auth/intro');
    router.replace('/auth/intro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo size={96} />
          </View>
          <Text style={styles.title}>{t.selectLanguage}</Text>
          <Text style={styles.subtitle}>{t.chooseLanguage}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageContainer}>
          <View style={styles.languageCard}>
            <Text style={styles.languageTitle}>SELECT LANGUAGE</Text>
            <View style={styles.languageButtons}>
              <Pressable 
                onPress={() => handleLanguageSelect('en')} 
                style={[styles.languageButton, styles.languageButtonActive]}
              >
                <Text style={styles.languageButtonText}>English</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => handleLanguageSelect('ar')} 
                style={styles.languageButton}
              >
                <Text style={styles.languageButtonText}>العربية</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change this later in settings
          </Text>
          <Text style={styles.footerTextArabic}>
            يمكنك تغيير هذا لاحقاً في الإعدادات
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.maroon,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gold,
    textAlign: 'center',
    lineHeight: 24,
  },
  languageContainer: {
    marginBottom: 48,
    width: '100%',
    maxWidth: 400,
  },
  languageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  languageTitle: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    color: COLORS.darkGray,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButtonActive: {
    backgroundColor: COLORS.maroon,
    borderColor: COLORS.maroon,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  footerTextArabic: {
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'center',
    fontWeight: '600',
  },
});