import { prisma } from '../prisma';
import { nanoid } from 'nanoid';

export interface CreateDealData {
  title: string;
  merchant: string;
  description: string;
  category: string;
  amount: number;
  discount: number;
  validUntil: Date; // input from UI
  location?: string;
  imageUrl?: string;
  userId: string; // Creator of the deal
}

export interface Deal {
  id: string;
  title: string;
  merchant: string;
  description: string;
  category: string;
  amount: number;
  discount: number;
  validUntil: Date;
  location?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes: DealUpvote[];
  creatorId: string;
}

export interface DealUpvote {
  id: string;
  userId: string;
  dealId: string;
  createdAt: Date;
}

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
  userId?: string; // For personalized results
}

export interface DealWithScore extends Deal {
  relevanceScore?: number;
  valueScore?: number;
  trendingScore?: number;
}

export class DealService {
  /**
   * Create a new deal
   */
  static async createDeal(data: CreateDealData): Promise<Deal> {
    const deal = await prisma.deal.create({
      data: {
        id: nanoid(32),
        title: data.title,
        merchant: data.merchant,
        description: data.description,
        category: data.category,
        amount: data.amount,
        discount: data.discount,
        validUntil: data.validUntil,
        location: data.location,
        imageUrl: data.imageUrl,
        creatorId: data.userId, // Add the creator ID
      },
      include: {
        upvotes: true,
      },
    });
    return deal as Deal;
  }

  /**
   * Get all deals with enhanced filtering and sorting
   */
  static async getDeals(filters?: DealFilters): Promise<DealWithScore[]> {
    const where: any = {};
    
    // Basic filters
    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    
    // Enhanced search with multiple fields
    if (filters?.search) {
      const searchTerms = filters.search.toLowerCase().split(' ').filter(term => term.length > 0);
      where.OR = searchTerms.map(term => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { merchant: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    // Price range filtering
    if (filters?.minPrice !== undefined) {
      where.amount = { ...where.amount, gte: filters.minPrice };
    }
    if (filters?.maxPrice !== undefined) {
      where.amount = { ...where.amount, lte: filters.maxPrice };
    }

    // Discount range filtering
    if (filters?.minDiscount !== undefined) {
      where.discount = { ...where.discount, gte: filters.minDiscount };
    }
    if (filters?.maxDiscount !== undefined) {
      where.discount = { ...where.discount, lte: filters.maxDiscount };
    }

    // Filter out expired deals
    where.validUntil = { gt: new Date() };

    // Get deals with basic ordering first
    let orderBy: any = { createdAt: 'desc' }; // Default sort
    
    if (filters?.sortBy && filters.sortBy !== 'relevance' && filters.sortBy !== 'best_value' && filters.sortBy !== 'trending') {
      switch (filters.sortBy) {
        case 'popular':
          orderBy = { upvotes: { _count: 'desc' } };
          break;
        case 'recent':
          orderBy = { createdAt: 'desc' };
          break;
        case 'expiring':
          orderBy = { validUntil: 'asc' };
          break;
      }
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy,
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        upvotes: true,
      },
    });

    // Apply advanced sorting algorithms
    let sortedDeals = deals as DealWithScore[];
    
    if (filters?.sortBy === 'relevance' && filters.search) {
      sortedDeals = this.calculateRelevanceScores(sortedDeals, filters.search);
      sortedDeals.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    } else if (filters?.sortBy === 'best_value') {
      sortedDeals = this.calculateValueScores(sortedDeals);
      sortedDeals.sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
    } else if (filters?.sortBy === 'trending') {
      sortedDeals = this.calculateTrendingScores(sortedDeals);
      sortedDeals.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    }

    return sortedDeals;
  }

  /**
   * Calculate relevance scores for search results
   */
  private static calculateRelevanceScores(deals: DealWithScore[], searchQuery: string): DealWithScore[] {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return deals.map(deal => {
      let score = 0;
      
      // Title matches get highest weight
      searchTerms.forEach(term => {
        if (deal.title.toLowerCase().includes(term)) score += 10;
        if (deal.merchant.toLowerCase().includes(term)) score += 8;
        if (deal.description.toLowerCase().includes(term)) score += 5;
        if (deal.category.toLowerCase().includes(term)) score += 3;
      });

      // Boost for exact matches
      if (deal.title.toLowerCase().includes(searchQuery.toLowerCase())) score += 5;
      if (deal.merchant.toLowerCase().includes(searchQuery.toLowerCase())) score += 3;

      // Boost for deals with more upvotes (social proof)
      score += Math.min(deal.upvotes.length * 0.5, 5);

      // Boost for newer deals
      const daysSinceCreation = (Date.now() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) score += 2;
      else if (daysSinceCreation < 30) score += 1;

      return { ...deal, relevanceScore: score };
    });
  }

  /**
   * Calculate value scores based on discount percentage and price
   */
  private static calculateValueScores(deals: DealWithScore[]): DealWithScore[] {
    return deals.map(deal => {
      const discountPercentage = (deal.discount / deal.amount) * 100;
      let score = 0;

      // Higher discount gets higher score
      if (discountPercentage >= 50) score += 10;
      else if (discountPercentage >= 30) score += 7;
      else if (discountPercentage >= 20) score += 5;
      else if (discountPercentage >= 10) score += 3;
      else score += 1;

      // Boost for deals with more upvotes
      score += Math.min(deal.upvotes.length * 0.3, 3);

      // Boost for deals expiring soon (urgency)
      const daysUntilExpiry = (deal.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry <= 3) score += 3;
      else if (daysUntilExpiry <= 7) score += 2;
      else if (daysUntilExpiry <= 14) score += 1;

      return { ...deal, valueScore: score };
    });
  }

  /**
   * Calculate trending scores based on recent activity
   */
  private static calculateTrendingScores(deals: DealWithScore[]): DealWithScore[] {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    return deals.map(deal => {
      let score = 0;

      // Base score from total upvotes
      score += Math.min(deal.upvotes.length * 2, 20);

      // Boost for recent upvotes
      const recentUpvotes = deal.upvotes.filter(upvote => 
        (now - upvote.createdAt.getTime()) < oneWeek
      );
      score += recentUpvotes.length * 3;

      // Boost for very recent upvotes (last 24 hours)
      const veryRecentUpvotes = deal.upvotes.filter(upvote => 
        (now - upvote.createdAt.getTime()) < oneDay
      );
      score += veryRecentUpvotes.length * 5;

      // Boost for newer deals
      const daysSinceCreation = (now - deal.createdAt.getTime()) / oneDay;
      if (daysSinceCreation < 3) score += 5;
      else if (daysSinceCreation < 7) score += 3;
      else if (daysSinceCreation < 14) score += 1;

      return { ...deal, trendingScore: score };
    });
  }

  /**
   * Get personalized deals for a user
   */
  static async getPersonalizedDeals(userId: string, limit: number = 20): Promise<DealWithScore[]> {
    // Get user's upvoted categories
    const userUpvotes = await prisma.dealUpvote.findMany({
      where: { userId },
      include: {
        deal: true,
      },
    });

    const categoryPreferences: Record<string, number> = {};
    userUpvotes.forEach(upvote => {
      const category = upvote.deal.category;
      categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
    });

    // Get deals with preference weighting
    const deals = await this.getDeals({ limit: limit * 2 }); // Get more to filter from
    
    // Apply personalization scoring
    const personalizedDeals = deals.map(deal => {
      let personalScore = 0;
      
      // Boost for preferred categories
      if (categoryPreferences[deal.category]) {
        personalScore += categoryPreferences[deal.category] * 2;
      }

      // Boost for deals from merchants user has upvoted before
      const hasUpvotedMerchant = userUpvotes.some(upvote => 
        upvote.deal.merchant === deal.merchant
      );
      if (hasUpvotedMerchant) personalScore += 3;

      return { ...deal, personalScore };
    });

    // Sort by personal score and return top results
    return personalizedDeals
      .sort((a, b) => (b.personalScore || 0) - (a.personalScore || 0))
      .slice(0, limit);
  }

  /**
   * Get deals with advanced search and filters
   */
  static async searchDeals(query: string, filters?: Omit<DealFilters, 'search'>): Promise<DealWithScore[]> {
    return this.getDeals({ ...filters, search: query });
  }

  /**
   * Get deals by price range
   */
  static async getDealsByPriceRange(minPrice: number, maxPrice: number, limit: number = 50): Promise<Deal[]> {
    return this.getDeals({ minPrice, maxPrice, limit, sortBy: 'best_value' });
  }

  /**
   * Get deals by discount range
   */
  static async getDealsByDiscountRange(minDiscount: number, maxDiscount: number, limit: number = 50): Promise<Deal[]> {
    return this.getDeals({ minDiscount, maxDiscount, limit, sortBy: 'best_value' });
  }

  /**
   * Get a specific deal by ID
   */
  static async getDealById(id: string): Promise<Deal | null> {
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        upvotes: true,
      },
    });
    return deal as Deal | null;
  }

  /**
   * Upvote a deal
   */
  static async upvoteDeal(userId: string, dealId: string): Promise<boolean> {
    try {
      // Check if user already upvoted
      const existingUpvote = await prisma.dealUpvote.findUnique({
        where: {
          userId_dealId: {
            userId,
            dealId,
          },
        },
      });

      if (existingUpvote) {
        // Remove upvote (toggle)
        await prisma.dealUpvote.delete({
          where: {
            userId_dealId: {
              userId,
              dealId,
            },
          },
        });
        return false; // Upvote removed
      } else {
        // Add upvote
        await prisma.dealUpvote.create({
          data: {
            id: nanoid(32),
            userId,
            dealId,
          },
        });
        return true; // Upvote added
      }
    } catch (error) {
      console.error('Error upvoting deal:', error);
      return false;
    }
  }

  /**
   * Check if user has upvoted a deal
   */
  static async hasUserUpvoted(userId: string, dealId: string): Promise<boolean> {
    const upvote = await prisma.dealUpvote.findUnique({
      where: {
        userId_dealId: {
          userId,
          dealId,
        },
      },
    });
    return !!upvote;
  }

  /**
   * Get deals by category
   */
  static async getDealsByCategory(category: string): Promise<Deal[]> {
    const deals = await prisma.deal.findMany({
      where: {
        category,
        validUntil: { gt: new Date() },
      },
      include: {
        upvotes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return deals as Deal[];
  }

  /**
   * Get deals by location
   */
  static async getDealsByLocation(location: string): Promise<Deal[]> {
    const deals = await prisma.deal.findMany({
      where: {
        location: { contains: location, mode: 'insensitive' },
        validUntil: { gt: new Date() },
      },
      include: {
        upvotes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return deals as Deal[];
  }

  /**
   * Get trending deals (most upvoted in last 7 days)
   */
  static async getTrendingDeals(limit: number = 10): Promise<Deal[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deals = await prisma.deal.findMany({
      where: {
        validUntil: { gt: new Date() },
        upvotes: {
          some: {
            createdAt: { gte: sevenDaysAgo },
          },
        },
      },
      include: {
        upvotes: true,
      },
      orderBy: {
        upvotes: { _count: 'desc' },
      },
      take: limit,
    });

    return deals as Deal[];
  }

  /**
   * Update a deal
   */
  static async updateDeal(
    id: string,
    data: Partial<CreateDealData>
  ): Promise<Deal> {
    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        upvotes: true,
      },
    });
    return deal as Deal;
  }

  /**
   * Delete a deal
   */
  static async deleteDeal(id: string): Promise<void> {
    await prisma.deal.delete({
      where: { id },
    });
  }

  /**
   * Get deal statistics
   */
  static async getDealStats(): Promise<{
    totalDeals: number;
    activeDeals: number;
    totalUpvotes: number;
    dealsByCategory: Record<string, number>;
  }> {
    const totalDeals = await prisma.deal.count();
    const activeDeals = await prisma.deal.count({
      where: { validUntil: { gt: new Date() } },
    });
    const totalUpvotes = await prisma.dealUpvote.count();
    
    const dealsByCategory = await prisma.deal.groupBy({
      by: ['category'],
      where: { validUntil: { gt: new Date() } },
      _count: { category: true },
    });

    const categoryCounts: Record<string, number> = {};
    dealsByCategory.forEach(item => {
      categoryCounts[item.category] = item._count.category;
    });

    return {
      totalDeals,
      activeDeals,
      totalUpvotes,
      dealsByCategory: categoryCounts,
    };
  }
}
