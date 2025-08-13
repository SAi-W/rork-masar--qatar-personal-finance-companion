import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { DealService } from "../../../../db/services/deals";

const upvoteDealSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
});

export const upvoteDealProcedure = protectedProcedure
  .input(upvoteDealSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const upvoted = await DealService.upvoteDeal(ctx.user.id, input.dealId);
      
      // Get updated deal info
      const deal = await DealService.getDealById(input.dealId);
      const hasUpvoted = await DealService.hasUserUpvoted(ctx.user.id, input.dealId);

      return {
        success: true,
        upvoted,
        hasUpvoted,
        deal,
        message: upvoted ? "Deal upvoted successfully" : "Upvote removed successfully",
      };
    } catch (error) {
      console.error("Error upvoting deal:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upvote deal"
      );
    }
  });

export default upvoteDealProcedure;
