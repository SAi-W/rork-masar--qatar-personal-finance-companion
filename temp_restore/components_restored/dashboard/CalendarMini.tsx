import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import BrutalCard from '@/components/BrutalCard';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Expense {
  id: string;
  amount: number;
  date: string;
}

interface CalendarMiniProps {
  expenses: Expense[];
}

export default function CalendarMini({ expenses }: CalendarMiniProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Create calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', isEmpty: true });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasExpenses = expenses.some(expense => expense.date === dateString);
      const totalAmount = expenses
        .filter(expense => expense.date === dateString)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      days.push({
        day,
        date: dateString,
        hasExpenses,
        totalAmount,
        isEmpty: false
      });
    }
    
    return days;
  }, [currentMonth, currentYear, expenses]);

  // Get expenses for current month
  const monthExpenses = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
  }, [expenses, currentMonth, currentYear]);

  const totalMonthExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseDays = monthExpenses.length > 0 ? monthExpenses.length : 0;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };



  return (
    <BrutalCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={20} color={COLORS.maroon} />
          <Text style={styles.title}>Calendar</Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <ChevronLeft size={16} color={COLORS.maroon} />
          </TouchableOpacity>
          <Text style={styles.monthYear}>{monthNames[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <ChevronRight size={16} color={COLORS.maroon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarGrid}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {calendarDays.map((dayData, index) => (
            <View key={index} style={styles.dayCell}>
              {!dayData.isEmpty && (
                <TouchableOpacity 
                  style={[
                    styles.dayButton,
                    dayData.hasExpenses && styles.expenseDay
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    dayData.hasExpenses && styles.expenseDayText
                  ]}>
                    {dayData.day}
                  </Text>
                  {dayData.hasExpenses && (
                    <View style={styles.expenseIndicator}>
                      <Text style={styles.expenseIndicatorText}>•</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Month Total</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalMonthExpenses)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expense Days</Text>
          <Text style={styles.summaryCount}>{expenseDays}</Text>
        </View>
      </View>
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
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 4,
  },
  monthYear: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 12,
  },
  calendarGrid: {
    marginBottom: 20,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  expenseDay: {
    backgroundColor: COLORS.lightMaroon,
    borderColor: COLORS.maroon,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  expenseDayText: {
    color: COLORS.maroon,
    fontWeight: '600',
  },
  expenseIndicator: {
    position: 'absolute',
    bottom: 2,
  },
  expenseIndicatorText: {
    fontSize: 8,
    color: COLORS.maroon,
    fontWeight: 'bold',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
});
