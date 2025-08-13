import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import BrutalCard from '@/components/BrutalCard';
import { PieChart } from 'react-native-chart-kit';
import { TrendingUp } from 'lucide-react-native';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
}

interface CategoryPieChartProps {
  expenses: Expense[];
}

const CATEGORY_COLORS = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  entertainment: '#45B7D1',
  shopping: '#96CEB4',
  health: '#FFEAA7',
  education: '#DDA0DD',
  utilities: '#98D8C8',
  subscriptions: '#F7DC6F',
  other: '#BB8FCE',
};

const CATEGORY_LABELS = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  health: 'Health',
  education: 'Education',
  utilities: 'Utilities',
  subscriptions: 'Subscriptions',
  other: 'Other',
};

export default function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for padding

  // Filter expenses for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= thirtyDaysAgo;
  });

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  recentExpenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  // Convert to chart data
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
    amount,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#BB8FCE',
    legendFontColor: COLORS.text,
    legendFontSize: 12,
  }));

  const totalSpending = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Sort by amount descending
  chartData.sort((a, b) => b.amount - a.amount);



  const getTopCategory = () => {
    if (chartData.length === 0) return null;
    return chartData[0];
  };

  const topCategory = getTopCategory();

  return (
    <BrutalCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TrendingUp size={20} color={COLORS.maroon} />
          <Text style={styles.title}>Spending by Category</Text>
        </View>
        <Text style={styles.period}>Last 30 Days</Text>
      </View>

      {chartData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.white,
                backgroundGradientFrom: COLORS.white,
                backgroundGradientTo: COLORS.white,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.totalSpending}>
              <Text style={styles.totalLabel}>Total Spending</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalSpending)}</Text>
            </View>

            {topCategory && (
              <View style={styles.topCategory}>
                <Text style={styles.topCategoryLabel}>Top Category</Text>
                <View style={styles.topCategoryInfo}>
                  <View 
                    style={[
                      styles.categoryColor, 
                      { backgroundColor: topCategory.color }
                    ]} 
                  />
                  <Text style={styles.topCategoryName}>{topCategory.name}</Text>
                  <Text style={styles.topCategoryAmount}>
                    {formatCurrency(topCategory.amount)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.legendContainer}>
            {chartData.slice(0, 6).map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: item.color }
                  ]} 
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.legendAmount}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses in the last 30 days</Text>
          <Text style={styles.emptySubtext}>
            Start tracking your spending to see category breakdown
          </Text>
        </View>
      )}
    </BrutalCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  period: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  totalSpending: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  topCategory: {
    alignItems: 'center',
  },
  topCategoryLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  topCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  topCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  topCategoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
