import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const extractReceiptProcedure = protectedProcedure
  .input(z.object({ fileUrl: z.string().url() }))
  .mutation(async ({ input }) => ({
    success: true,
    suggestion: {
      amountMinor: 2595, // stub QAR 25.95
      dateISO: new Date().toISOString(),
      merchant: "Coffee Shop",
      categoryGuess: "food",
      receiptId: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }));

export default extractReceiptProcedure;
