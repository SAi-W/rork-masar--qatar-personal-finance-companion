import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const processSalaryDepositProcedure = publicProcedure
  .input(z.object({
    amount: z.number().positive(),
    date: z.coerce.date(),
  }))
  .mutation(async ({ ctx, input }) => {
    // TODO: create transaction + allocations
    return { ok: true };
  });
