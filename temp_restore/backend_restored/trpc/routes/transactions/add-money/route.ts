import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const addMoneyProcedure = publicProcedure
  .input(z.object({
    accountId: z.string().min(1),
    amount: z.number().positive(),
    reference: z.string().optional(),
    happenedAt: z.coerce.date(),
  }))
  .mutation(async ({ ctx, input }) => {
    // TODO: prisma.transaction.create(...)
    return { ok: true };
  });
