import { z } from "zod";
import { publicProcedure } from "../../../create-context"; // ← adjust path to your init

export const updateSalarySettingsProcedure = publicProcedure
  .input(z.object({
    salary: z.number().positive(),
    payDay: z.number().int().min(1).max(31),
    autoAllocate: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // TODO: persist to Prisma (e.g., user settings)
    return { ok: true };
  });
