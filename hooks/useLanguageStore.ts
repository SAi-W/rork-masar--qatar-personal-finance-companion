import { useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { translations, Language, Translations } from '@/constants/translations';
import { storage } from '@/lib/storage';

interface LanguageState {
  language: Language;
  t: Translations;
  isRTL: boolean;
  isLoading: boolean;
}

interface LanguageActions {
  setLanguage: (lang: Language) => Promise<void>;
  initializeLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = 'language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [state, setState] = useState<LanguageState>({
    language: 'en',
    t: translations.en,
    isRTL: false,
    isLoading: true,
  });

  const setLanguage = async (lang: Language) => {
    try {
      const isRTL = lang === 'ar';
      
      // Save to regular storage (non-sensitive)
      await storage.setItem(LANGUAGE_KEY, lang);
      
      // Update RTL layout if needed
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }
      
      setState(prev => ({
        ...prev,
        language: lang,
        t: translations[lang],
        isRTL,
      }));
      
      console.log(`Language changed to: ${lang}`);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const initializeLanguage = async () => {
    try {
      console.log('🌐 Initializing language...');
      setState(prev => ({ ...prev, isLoading: true }));
      
      const savedLanguage = await storage.getItem(LANGUAGE_KEY) as Language | null;
      const language = savedLanguage || 'en';
      const isRTL = language === 'ar';
      
      console.log('💾 Saved language:', savedLanguage, 'Using:', language);
      
      // Set RTL layout
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      setState({
        language,
        t: translations[language],
        isRTL,
        isLoading: false,
      });
      
      console.log(`✅ Language initialized: ${language}`);
    } catch (error) {
      console.error('💥 Error initializing language:', error);
      setState({
        language: 'en',
        t: translations.en,
        isRTL: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    initializeLanguage();
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⚠️ Language loading timeout, forcing completion');
      setState(prev => ({
        ...prev,
        isLoading: false,
        language: 'en',
        t: translations.en,
        isRTL: false,
      }));
    }, 1000); // 1 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  return {
    ...state,
    setLanguage,
    initializeLanguage,
  };
});