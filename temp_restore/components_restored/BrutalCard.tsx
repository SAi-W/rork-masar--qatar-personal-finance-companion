import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '@/constants/colors';

interface BrutalCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outline' | 'flat';
  testID?: string;
}

const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  style,
  variant = 'default',
  testID,
}) => {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.border,
          borderWidth: 1,
        };
      case 'flat':
        return {
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
          borderWidth: 1,
          ...SHADOWS.subtle,
        };
      default:
        return {
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 16,
          ...SHADOWS.subtle,
        };
    }
  };

  return (
    <View style={[styles.card, getCardStyle(), style]} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
  },
});

export default BrutalCard;