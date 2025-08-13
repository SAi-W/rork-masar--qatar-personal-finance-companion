import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Receipt, Shield, MapPin } from 'lucide-react-native';
import BrutalButton from '@/components/BrutalButton';
import { COLORS, SHADOWS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuthStore';
import { useLanguage } from '@/hooks/useLanguageStore';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreen {
  id: number;
  titleKey: keyof typeof import('@/constants/translations').englishTranslations;
  subtitleKey: keyof typeof import('@/constants/translations').englishTranslations;
  descriptionKey: keyof typeof import('@/constants/translations').englishTranslations;
  icon: React.ComponentType<any>;
  color: string;
}

export default function IntroScreen() {
  const { markIntroSeen } = useAuth();
  const { t, isRTL } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const onboardingData: OnboardingScreen[] = [
    {
      id: 1,
      titleKey: 'trackSaveGrow',
      subtitleKey: 'trackSaveGrowSubtitle',
      descriptionKey: 'trackSaveGrowDescription',
      icon: Receipt,
      color: COLORS.maroon,
    },
    {
      id: 2,
      titleKey: 'privateByDesign',
      subtitleKey: 'privateByDesignSubtitle',
      descriptionKey: 'privateByDesignDescription',
      icon: Shield,
      color: COLORS.gold,
    },
    {
      id: 3,
      titleKey: 'builtForQatar',
      subtitleKey: 'builtForQatarSubtitle',
      descriptionKey: 'builtForQatarDescription',
      icon: MapPin,
      color: COLORS.success,
    },
  ];

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      await markIntroSeen();
      router.replace('/auth/welcome');
    }
  };

  const handleSkip = async () => {
    await markIntroSeen();
    router.replace('/auth/welcome');
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
    
    animatedValue.setValue(contentOffsetX / screenWidth);
  };

  const renderScreen = (screen: OnboardingScreen, index: number) => {
    const IconComponent = screen.icon;
    
    return (
      <View key={screen.id} style={[styles.screenContainer, { width: screenWidth }]}>
        <View style={styles.contentContainer}>
          {/* Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: screen.color }]}>
            <View style={styles.iconWrapper}>
              <IconComponent 
                size={80} 
                color={screen.color === COLORS.gold ? COLORS.black : COLORS.white} 
                strokeWidth={3}
              />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isRTL && styles.rtlText]}>{t[screen.titleKey]}</Text>
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t[screen.subtitleKey]}</Text>
            <Text style={[styles.description, isRTL && styles.rtlText]}>{t[screen.descriptionKey]}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.paginationDot,
                isActive && styles.paginationDotActive,
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <View style={styles.skipContainer}>
        <BrutalButton
          title={t.skip}
          onPress={handleSkip}
          variant="outline"
          size="small"
          style={styles.skipButton}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((screen, index) => renderScreen(screen, index))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {renderPagination()}
        
        <View style={styles.buttonContainer}>
          <BrutalButton
            title={currentIndex === onboardingData.length - 1 ? t.getStarted : t.next}
            onPress={handleNext}
            variant="primary"
            size="large"
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderWidth: 4,
    borderColor: COLORS.black,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    transform: [{ skewX: '-2deg' }],
    ...SHADOWS.brutal,
  },
  iconWrapper: {
    transform: [{ skewX: '2deg' }],
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: 36,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 0,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.maroon,
    transform: [{ scale: 1.2 }],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  nextButton: {
    width: '100%',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});