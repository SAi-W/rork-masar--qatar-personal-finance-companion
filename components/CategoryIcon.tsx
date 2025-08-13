import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { 
  ShoppingBag, 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  Tv, 
  Heart, 
  BookOpen, 
  Plane, 
  MoreHorizontal 
} from 'lucide-react-native';
import { Category } from '@/types';
import { categoryColors } from '@/mocks/data';
import { COLORS } from '@/constants/colors';

interface CategoryIconProps {
  category: Category;
  size?: number;
  style?: ViewStyle;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 24,
  style,
  color,
}) => {
  const getIcon = () => {
    const iconColor = color || COLORS.white;
    
    switch (category) {
      case 'food':
        return <Utensils size={size} color={iconColor} />;
      case 'transportation':
        return <Car size={size} color={iconColor} />;
      case 'housing':
        return <Home size={size} color={iconColor} />;
      case 'utilities':
        return <Zap size={size} color={iconColor} />;
      case 'entertainment':
        return <Tv size={size} color={iconColor} />;
      case 'shopping':
        return <ShoppingBag size={size} color={iconColor} />;
      case 'health':
        return <Heart size={size} color={iconColor} />;
      case 'education':
        return <BookOpen size={size} color={iconColor} />;
      case 'travel':
        return <Plane size={size} color={iconColor} />;
      case 'other':
        return <MoreHorizontal size={size} color={iconColor} />;
      default:
        return <MoreHorizontal size={size} color={iconColor} />;
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: categoryColors[category] },
        style
      ]}
    >
      {getIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
});

export default CategoryIcon;