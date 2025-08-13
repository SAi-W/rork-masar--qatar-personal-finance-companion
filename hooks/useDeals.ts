import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Deal } from '@/types';

export interface DealFilters {
  category?: string;
  location?: string;
  search?: string;
  sortBy?: 'popular' | 'recent' | 'expiring' | 'relevance' | 'best_value' | 'trending';
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  maxDiscount?: number;
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface DealStats {
  totalDeals: number;
  activeDeals: number;
  totalUpvotes: number;
  dealsByCategory: Record<string, number>;
}

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DealStats | null>(null);
  const [filters, setFilters] = useState<DealFilters>({
    sortBy: 'popular',
    limit: 50,
    offset: 0,
  });

  // tRPC mutations and queries
  const createDealMutation = trpc.deals.create.useMutation();
  const upvoteDealMutation = trpc.deals.upvote.useMutation();
  const listDealsQuery = trpc.deals.list.useQuery(
    { 
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      category: filters.category,
      location: filters.location,
      search: filters.search,
      sortBy: filters.sortBy || 'popular'
    }
  );

  // Fetch deals with current filters
  const fetchDeals = useCallback(async (newFilters: DealFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update filters and refetch
      setFilters(prev => ({ ...prev, ...newFilters }));
      
      // The query will automatically refetch with new filters
      await listDealsQuery.refetch();
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch deals');
    } finally {
      setIsLoading(false);
    }
  }, [listDealsQuery]);

  // Create a new deal
  const createDeal = useCallback(async (dealData: {
    title: string;
    merchant: string;
    description: string;
    category: string;
    amount: number;
    discount: number;
    validUntil: string;
    location?: string;
    imageUrl?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await createDealMutation.mutateAsync(dealData);
      
      if (result && result.success && result.deal) {
        // Convert backend deal to frontend deal format
        const frontendDeal: Deal = {
          id: result.deal.id,
          title: result.deal.title,
          merchant: result.deal.merchant,
          location: result.deal.location || '',
          upvotes: Array.isArray(result.deal.upvotes) ? result.deal.upvotes.length : 0,
          expiresAt: result.deal.validUntil.toISOString(),
          imageUrl: result.deal.imageUrl || '',
          category: result.deal.category as any,
          amount: result.deal.amount,
          discount: result.deal.discount,
          description: result.deal.description,
        };
        
        // Add the new deal to the list
        setDeals(prevDeals => [frontendDeal, ...prevDeals]);
        return frontendDeal;
      } else {
        throw new Error('Failed to create deal');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      setError(error instanceof Error ? error.message : 'Failed to create deal');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createDealMutation]);

  // Upvote/unupvote a deal
  const upvoteDeal = useCallback(async (dealId: string) => {
    try {
      setError(null);
      
      const result = await upvoteDealMutation.mutateAsync({ dealId });
      
      if (result && result.success) {
        // Update the deal in the list
        setDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.id === dealId 
              ? { ...deal, upvotes: typeof result.deal?.upvotes === 'number' ? result.deal.upvotes : deal.upvotes }
              : deal
          )
        );
        return result;
      } else {
        throw new Error('Failed to upvote deal');
      }
    } catch (error) {
      console.error('Error upvoting deal:', error);
      setError(error instanceof Error ? error.message : 'Failed to upvote deal');
      throw error;
    }
  }, [upvoteDealMutation]);

  // Search deals
  const searchDeals = useCallback(async (query: string, searchFilters?: Partial<DealFilters>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newFilters = {
        ...filters,
        ...searchFilters,
        search: query,
        sortBy: 'relevance' as const,
      };
      
      await fetchDeals(newFilters);
    } catch (error) {
      console.error('Error searching deals:', error);
      setError(error instanceof Error ? error.message : 'Failed to search deals');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters, fetchDeals]);

  // Get deals by price range
  const getDealsByPriceRange = useCallback(async (minPrice: number, maxPrice: number, limit: number = 50) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newFilters = {
        ...filters,
        minPrice,
        maxPrice,
        limit,
        sortBy: 'best_value' as const,
      };
      
      await fetchDeals(newFilters);
    } catch (error) {
      console.error('Error fetching deals by price range:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch deals by price range');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters, fetchDeals]);

  // Get deals by discount range
  const getDealsByDiscountRange = useCallback(async (minDiscount: number, maxDiscount: number, limit: number = 50) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newFilters = {
        ...filters,
        minDiscount,
        maxDiscount,
        limit,
        sortBy: 'best_value' as const,
      };
      
      await fetchDeals(newFilters);
    } catch (error) {
      console.error('Error fetching deals by discount range:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch deals by discount range');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters, fetchDeals]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh deals
  const refreshDeals = useCallback(() => {
    listDealsQuery.refetch();
  }, [listDealsQuery]);

  // Update loading state based on query
  useEffect(() => {
    setIsLoading(listDealsQuery.isLoading);
  }, [listDealsQuery.isLoading]);

  // Update error state based on query
  useEffect(() => {
    if (listDealsQuery.error) {
      setError(listDealsQuery.error.message);
    }
  }, [listDealsQuery.error]);

  // Update deals when query data changes
  useEffect(() => {
    if (listDealsQuery.data?.deals) {
      // Convert backend deals to frontend format
      const frontendDeals: Deal[] = listDealsQuery.data.deals.map(backendDeal => ({
        id: backendDeal.id,
        title: backendDeal.title,
        merchant: backendDeal.merchant,
        location: backendDeal.location || '',
        upvotes: Array.isArray(backendDeal.upvotes) ? backendDeal.upvotes.length : 0,
        expiresAt: backendDeal.validUntil.toISOString(),
        imageUrl: backendDeal.imageUrl || '',
        category: backendDeal.category as any,
        amount: backendDeal.amount,
        discount: backendDeal.discount,
        description: backendDeal.description,
      }));
      
      setDeals(frontendDeals);
    }
  }, [listDealsQuery.data]);

  return {
    deals: deals.length > 0 ? deals : (listDealsQuery.data?.deals || []),
    isLoading,
    error,
    stats,
    filters,
    fetchDeals,
    createDeal,
    upvoteDeal,
    searchDeals,
    getDealsByPriceRange,
    getDealsByDiscountRange,
    fetchTrendingDeals: () => fetchDeals({ sortBy: 'trending' }),
    fetchDealsByCategory: (category: string) => fetchDeals({ category }),
    fetchDealsByLocation: (location: string) => fetchDeals({ location }),
    fetchDealStats: () => Promise.resolve(null), // TODO: Implement when backend supports it
    clearError,
    refreshDeals,
  };
};
