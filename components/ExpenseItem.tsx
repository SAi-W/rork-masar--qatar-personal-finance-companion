import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Expense } from '@/types';
import { COLORS } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CategoryIcon from './CategoryIcon';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      testID={`expense-item-${expense.id}`}
    >
      <View style={styles.iconContainer}>
        <CategoryIcon category={expense.category} size={20} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.merchant}>{expense.merchant}</Text>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text style={styles.date}>{formatDate(expense.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.lightGray,
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  merchant: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default ExpenseItem;