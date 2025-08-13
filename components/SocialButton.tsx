import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SHADOWS } from '@/constants/colors';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export function SocialButton({ 
  title, 
  onPress, 
  icon, 
  variant = 'outline',
  disabled = false,
  loading = false 
}: SocialButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton];
      case 'secondary':
        return [styles.button, styles.secondaryButton];
      case 'outline':
      default:
        return [styles.button, styles.outlineButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.buttonText, styles.primaryText];
      case 'secondary':
        return [styles.buttonText, styles.secondaryText];
      case 'outline':
      default:
        return [styles.buttonText, styles.outlineText];
    }
  };

  return (
    <TouchableOpacity 
      style={[...getButtonStyle(), disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={getTextStyle()}>
          {loading ? 'Loading...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: COLORS.black,
    ...SHADOWS.brutal,
  },
  primaryButton: {
    backgroundColor: COLORS.maroon,
  },
  secondaryButton: {
    backgroundColor: COLORS.gold,
  },
  outlineButton: {
    backgroundColor: COLORS.white,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.black,
  },
  outlineText: {
    color: COLORS.black,
  },
});