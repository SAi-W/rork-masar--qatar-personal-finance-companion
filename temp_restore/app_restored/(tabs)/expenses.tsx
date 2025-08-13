import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { COLORS, SHADOWS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import { useLanguage } from '@/hooks/useLanguageStore';
import BrutalCard from '@/components/BrutalCard';
import ExpenseItem from '@/components/ExpenseItem';
import BrutalButton from '@/components/BrutalButton';
import { useExpenses, useAccounts } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { Plus, Search, Filter, X } from 'lucide-react-native';
import AddExpenseModal from '@/components/AddExpenseModal';
import { Category } from '@/types';

export default function ExpensesScreen() {
  const { expenses, addExpense } = useExpenses();
  const { accounts } = useAccounts();
  const createExpense = trpc.expenses.create.useMutation();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const params = useLocalSearchParams();
  const [presetData, setPresetData] = useState<string | undefined>();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and search expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Search by title or merchant
    if (searchQuery) {
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.merchant.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(expense => expense.accountId === selectedAccount);
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchQuery, selectedCategory, selectedAccount, sortBy, sortOrder]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map(expense => expense.category))];
    return uniqueCategories.sort();
  }, [expenses]);

  // Get total expenses for filtered results
  const totalFilteredExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedAccount !== 'all';

  // Handle preset data from OCR
  useEffect(() => {
    if (params.preset) {
      setPresetData(params.preset as string);
      setShowAddModal(true);
    }
  }, [params.preset]);

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title={t.expenses}
        subtitle={t.trackSaveGrow}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.darkGray}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
        >
          <Filter size={20} color={showFilters ? COLORS.white : COLORS.maroon} />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, selectedCategory === 'all' && styles.filterOptionActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.filterOptionText, selectedCategory === 'all' && styles.filterOptionTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[styles.filterOption, selectedCategory === category && styles.filterOptionActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.filterOptionText, selectedCategory === category && styles.filterOptionTextActive]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, selectedAccount === 'all' && styles.filterOptionActive]}
                onPress={() => setSelectedAccount('all')}
              >
                <Text style={[styles.filterOptionText, selectedAccount === 'all' && styles.filterOptionTextActive]}>
                  All Accounts
                </Text>
              </TouchableOpacity>
              {accounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={[styles.filterOption, selectedAccount === account.id && styles.filterOptionActive]}
                  onPress={() => setSelectedAccount(account.id)}
                >
                  <Text style={[styles.filterOptionText, selectedAccount === account.id && styles.filterOptionTextActive]}>
                    {account.nickname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'date' && styles.sortOptionActive]}
                onPress={() => setSortBy('date')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'date' && styles.sortOptionTextActive]}>
                  Date
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'amount' && styles.sortOptionActive]}
                onPress={() => setSortBy('amount')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'amount' && styles.sortOptionTextActive]}>
                  Amount
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'category' && styles.sortOptionActive]}
                onPress={() => setSortBy('category')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'category' && styles.sortOptionTextActive]}>
                  Category
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Text style={styles.sortOrderText}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Text>
            </TouchableOpacity>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.resultsSummary}>
        <Text style={styles.resultsText}>
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          {hasActiveFilters && ` (filtered from ${expenses.length})`}
        </Text>
        {hasActiveFilters && (
          <Text style={styles.totalAmount}>
            Total: QR {totalFilteredExpenses.toFixed(2)}
          </Text>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <BrutalCard>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <ExpenseItem key={expense.id} expense={expense} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {hasActiveFilters ? 'No expenses match your filters' : t.noExpenses}
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersLink}>
                    <Text style={styles.clearFiltersLinkText}>Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </BrutalCard>
        </View>
        
        <View style={styles.buttonContainer}>
          <BrutalButton
            title={t.addNewExpense}
            onPress={() => setShowAddModal(true)}
            variant="primary"
          />
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fabContainer} onPress={() => setShowAddModal(true)}>
        <View style={styles.fab}>
          <Plus size={24} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={() => {
          // Refresh expenses list
          // This will be handled by the store
        }}
        preset={presetData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.darkGray,
    padding: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: COLORS.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.black,
    ...SHADOWS.brutal,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    ...SHADOWS.brutal,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  clearButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.maroon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.maroon,
  },
  filtersPanel: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    ...SHADOWS.brutal,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.darkGray,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterOptionActive: {
    backgroundColor: COLORS.maroon,
    borderColor: COLORS.maroon,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  filterOptionTextActive: {
    color: COLORS.white,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sortOptionActive: {
    backgroundColor: COLORS.maroon,
    borderColor: COLORS.maroon,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  sortOrderButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sortOrderText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  clearFiltersButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    ...SHADOWS.brutal,
  },
  resultsText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.maroon,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  clearFiltersLink: {
    marginTop: 10,
  },
  clearFiltersLinkText: {
    fontSize: 14,
    color: COLORS.maroon,
    textDecorationLine: 'underline',
  },
});