import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { DealService } from "../../../../db/services/deals";

const createDealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  merchant: z.string().min(1, "Merchant is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  discount: z.number().min(0, "Discount must be 0 or greater"),
  // Accept either field from UI, normalize later
  validUntil: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  location: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const createDealProcedure = protectedProcedure
  .input(createDealSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const iso =
        input.expiresAt ??
        input.validUntil ??
        new Date(Date.now() + 7 * 864e5).toISOString(); // default +7 days
      const deal = await DealService.createDeal({
        ...input,
        userId: ctx.user.id,
        validUntil: new Date(iso),
      });

      return {
        success: true,
        deal,
        message: "Deal created successfully",
      };
    } catch (error) {
      console.error("Error creating deal:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create deal"
      );
    }
  });

export default createDealProcedure;
