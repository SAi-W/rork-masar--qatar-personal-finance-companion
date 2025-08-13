import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '@/constants/colors';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  showBorder?: boolean;
}

export default function Logo({ size = 100, style, showBorder = true }: LogoProps) {
  return (
    <View style={[
      styles.container,
      { width: size, height: size },
      showBorder && styles.withBorder,
      style
    ]}>
      <Image
        source={{ uri: 'https://r2-pub.rork.com/attachments/rhrfb0bq5qx6vj9x00xd8' }}
        style={[styles.image, { width: size * 0.8, height: size * 0.8 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
  },
  withBorder: {
    borderWidth: 4,
    borderColor: COLORS.black,
    ...SHADOWS.brutal,
  },
  image: {
    borderRadius: 0,
    resizeMode: 'contain',
    // remove any transforms like rotate that tilt the logo
    // transform: [] 
  },
});