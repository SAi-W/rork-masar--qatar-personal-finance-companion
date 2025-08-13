import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Languages } from 'lucide-react-native';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import Logo from '@/components/Logo';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/hooks/useLanguageStore';
import { Language } from '@/constants/translations';

export default function LanguageSelectionScreen() {
  const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = async (lang: Language) => {
    await setLanguage(lang);
    router.replace('/auth/intro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo size={120} />
          </View>
          <Text style={styles.title}>{t.selectLanguage}</Text>
          <Text style={styles.subtitle}>{t.chooseLanguage}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.languageContainer}>
          <BrutalCard style={styles.languageCard}>
            <View style={styles.languageOption}>
              <Languages size={24} color={COLORS.black} />
              <BrutalButton
                title="English"
                onPress={() => handleLanguageSelect('en')}
                variant="outline"
                size="large"
                style={styles.languageButton}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.languageOption}>
              <Languages size={24} color={COLORS.black} />
              <BrutalButton
                title="العربية"
                onPress={() => handleLanguageSelect('ar')}
                variant="outline"
                size="large"
                style={styles.languageButton}
              />
            </View>
          </BrutalCard>
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
    marginBottom: 32,
    transform: [{ rotate: '-2deg' }],
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
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  languageButton: {
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 4,
    backgroundColor: COLORS.black,
    marginVertical: 24,
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