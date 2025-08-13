import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import BrutalCard from '@/components/BrutalCard';
import BrutalButton from '@/components/BrutalButton';
import CategoryIcon from '@/components/CategoryIcon';
import CreateDealModal from '@/components/CreateDealModal';
import { useDeals } from '@/hooks/useDeals';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { ThumbsUp, MapPin, Search, Filter, Plus, TrendingUp, AlertCircle, Percent, X } from 'lucide-react-native';
import { Category } from '@/types';

type SortOption = 'popular' | 'recent' | 'expiring' | 'relevance' | 'best_value' | 'trending';

export default function DealsScreen() {
  const { 
    deals, 
    isLoading, 
    error, 
    stats,
    fetchDeals, 
    upvoteDeal, 
    createDeal,
    searchDeals,
    getDealsByPriceRange,
    getDealsByDiscountRange,
    clearError 
  } = useDeals();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  
  // New filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minDiscount, setMinDiscount] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const categories: (Category | 'all')[] = ['all', 'food', 'entertainment', 'shopping', 'health', 'transportation', 'travel', 'education'];
  const sortOptions: { key: SortOption; label: string; icon: React.ReactNode }[] = [
    { key: 'popular', label: 'Most Popular', icon: <TrendingUp size={14} color={COLORS.black} /> },
    { key: 'recent', label: 'Recently Added', icon: <AlertCircle size={14} color={COLORS.black} /> },
    { key: 'expiring', label: 'Expiring Soon', icon: <AlertCircle size={14} color={COLORS.black} /> },
    { key: 'relevance', label: 'Most Relevant', icon: <Search size={14} color={COLORS.black} /> },
    { key: 'best_value', label: 'Best Value', icon: <Percent size={14} color={COLORS.black} /> },
    { key: 'trending', label: 'Trending Now', icon: <TrendingUp size={14} color={COLORS.black} /> },
  ];

  // Enhanced filtering and sorting logic
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals.filter(deal => {
      const matchesSearch = searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
      
      const matchesPrice = (!minPrice || deal.amount >= parseFloat(minPrice)) &&
                          (!maxPrice || deal.amount <= parseFloat(maxPrice));
      
      const matchesDiscount = (!minDiscount || deal.discount >= parseFloat(minDiscount)) &&
                             (!maxDiscount || deal.discount <= parseFloat(maxDiscount));
      
      return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
    });

    // Apply sorting based on selected option
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'recent':
          return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime();
        case 'expiring':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        case 'relevance':
          // Relevance is already handled by backend when search is active
          return 0;
        case 'best_value':
          const aValue = (a.discount / a.amount) * 100;
          const bValue = (b.discount / b.amount) * 100;
          return bValue - aValue;
        case 'trending':
          // Trending is already handled by backend
          return 0;
        default:
          return 0;
      }
    });
  }, [deals, searchQuery, selectedCategory, sortBy, minPrice, maxPrice, minDiscount, maxDiscount]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        if (sortBy === 'relevance') {
          searchDeals(searchQuery.trim(), {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
            maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
          });
        } else {
          fetchDeals({
            search: searchQuery.trim(),
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            sortBy,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
            maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
          });
        }
      } else {
        fetchDeals({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          minDiscount: minDiscount ? parseFloat(minDiscount) : undefined,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, minDiscount, maxDiscount]);

  const handleUpvote = (dealId: string) => {
    upvoteDeal(dealId);
  };

  const handleAddDeal = () => {
    setShowCreateModal(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('popular');
    setMinPrice('');
    setMaxPrice('');
    setMinDiscount('');
    setMaxDiscount('');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || minPrice || maxPrice || minDiscount || maxDiscount;

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title="Community Deals" 
        subtitle={`${filteredAndSortedDeals.length} deals available`}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals, merchants, locations..."
            placeholderTextColor={COLORS.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={COLORS.darkGray} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {category !== 'all' && (
                  <CategoryIcon 
                    category={category as Category} 
                    size={16} 
                    color={selectedCategory === category ? COLORS.white : COLORS.black}
                  />
                )}
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortFilters}>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  sortBy === option.key && styles.sortChipActive
                ]}
                onPress={() => setSortBy(option.key)}
              >
                {option.icon}
                <Text style={[
                  styles.sortChipText,
                  sortBy === option.key && styles.sortChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.advancedFiltersButton}
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Text style={styles.advancedFiltersButtonText}>
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Text>
          </TouchableOpacity>

          {showAdvancedFilters && (
            <View style={styles.advancedFiltersContainer}>
              <View style={styles.filterRow}>
                <View style={styles.filterInputContainer}>
                  <DollarSign size={16} color={COLORS.darkGray} />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Min Price"
                    placeholderTextColor={COLORS.darkGray}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.filterInputContainer}>
                  <DollarSign size={16} color={COLORS.darkGray} />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Max Price"
                    placeholderTextColor={COLORS.darkGray}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.filterRow}>
                <View style={styles.filterInputContainer}>
                  <Percent size={16} color={COLORS.darkGray} />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Min Discount"
                    placeholderTextColor={COLORS.darkGray}
                    value={minDiscount}
                    onChangeText={setMinDiscount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.filterInputContainer}>
                  <Percent size={16} color={COLORS.darkGray} />
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Max Discount"
                    placeholderTextColor={COLORS.darkGray}
                    value={maxDiscount}
                    onChangeText={setMaxDiscount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {filteredAndSortedDeals.length > 0 ? (
          filteredAndSortedDeals.map(deal => (
            <BrutalCard key={deal.id} style={styles.dealCard}>
              <Image 
                source={{ uri: deal.imageUrl }} 
                style={styles.dealImage} 
                resizeMode="cover"
              />
              
              <View style={styles.dealContent}>
                <View style={styles.dealHeader}>
                  <View style={styles.categoryBadge}>
                    <CategoryIcon category={deal.category} size={12} color={COLORS.white} />
                    <Text style={styles.categoryBadgeText}>
                      {deal.category.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>
                      {formatCurrency(deal.amount)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.dealTitle}>{deal.title}</Text>
                
                <View style={styles.merchantContainer}>
                  <Text style={styles.merchantName}>{deal.merchant}</Text>
                  <View style={styles.locationContainer}>
                    <MapPin size={14} color={COLORS.darkGray} />
                    <Text style={styles.locationText}>{deal.location}</Text>
                  </View>
                </View>

                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>
                    Save {formatCurrency(deal.discount)} ({(deal.discount / deal.amount * 100).toFixed(0)}% off)
                  </Text>
                </View>
                
                <View style={styles.dealFooter}>
                  <View style={styles.expiryContainer}>
                    <Text style={styles.expiryLabel}>EXPIRES</Text>
                    <Text style={styles.expiryDate}>{formatDate(deal.expiresAt)}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.upvoteButton}
                    onPress={() => handleUpvote(deal.id)}
                  >
                    <ThumbsUp size={16} color={COLORS.maroon} />
                    <Text style={styles.upvotesText}>{deal.upvotes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BrutalCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {hasActiveFilters 
                ? 'No deals match your filters' 
                : 'No deals available at the moment'
              }
            </Text>
            {hasActiveFilters && (
              <BrutalButton
                title="Clear All Filters"
                onPress={clearAllFilters}
                style={styles.clearFiltersButton}
              />
            )}
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity style={styles.fab} onPress={handleAddDeal}>
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>

      <CreateDealModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createDeal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.black,
    paddingVertical: 16,
  },
  categoryFilters: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.maroon,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  sortFilters: {
    paddingHorizontal: 16,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  sortChipActive: {
    backgroundColor: COLORS.gold,
  },
  sortChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  sortChipTextActive: {
    color: COLORS.black,
  },
  advancedFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    marginTop: 12,
  },
  advancedFiltersButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  advancedFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 8,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  filterInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dealCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  dealImage: {
    width: '100%',
    height: 180,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.black,
  },
  dealContent: {
    padding: 16,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.maroon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  priceBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
  },
  dealTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  merchantContainer: {
    marginBottom: 16,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  discountContainer: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryContainer: {},
  expiryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkGray,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  upvotesText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginLeft: 6,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: COLORS.maroon,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
});