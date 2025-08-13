import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const createSideIncomeProcedure = publicProcedure
  .input(z.object({
    title: z.string().min(1),
    amount: z.number().positive(),
    receivedAt: z.coerce.date(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
    // TODO: prisma.sideIncome.create(...)
    return { ok: true, id: "stub" };
  });
