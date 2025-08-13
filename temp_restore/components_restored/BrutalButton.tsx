import React from 'react';
import { 
  StyleSheet, 
  Text, 
  ViewStyle, 
  TextStyle, 
  Animated, 
  Pressable 
} from 'react-native';
import { COLORS, SHADOWS } from '@/constants/colors';

interface BrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

const BrutalButton: React.FC<BrutalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
  loading = false,
  testID,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.maroon,
          borderColor: COLORS.black,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.gold,
          borderColor: COLORS.black,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: COLORS.white,
          borderColor: COLORS.black,
        };
        break;
    }

    if (disabled || loading) {
      buttonStyle.opacity = 0.5;
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    if (variant === 'primary') return { color: COLORS.white };
    if (variant === 'secondary') return { color: COLORS.black };
    // Outline buttons must have visible text
    if (variant === 'outline') return { color: COLORS.black };
    return {};
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
    }
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          {
            transform: [
              { translateX },
              { translateY },
            ],
          },
          style,
        ]}
      >
        <Text 
          style={[
            styles.text, 
            getTextStyle(),
            textStyle
          ]}
        >
          {loading ? 'LOADING...' : title.toUpperCase()}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 4,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutal,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default BrutalButton;