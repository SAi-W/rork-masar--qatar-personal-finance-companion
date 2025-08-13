import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { DealService } from "../../../../db/services/deals";

const listDealsSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['popular', 'recent', 'expiring', 'relevance', 'best_value', 'trending']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minDiscount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  userId: z.string().optional(), // For personalized results
});

export const listDealsProcedure = publicProcedure
  .input(listDealsSchema)
  .query(async ({ input }) => {
    try {
      let deals;
      
      // Handle personalized deals if userId is provided
      if (input.userId && (!input.sortBy || input.sortBy === 'popular')) {
        deals = await DealService.getPersonalizedDeals(input.userId, input.limit || 20);
      } else {
        deals = await DealService.getDeals(input);
      }
      
      const stats = await DealService.getDealStats();

      return {
        success: true,
        deals,
        stats,
      };
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch deals"
      );
    }
  });

export default listDealsProcedure;
