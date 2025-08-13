import { publicProcedure } from "../../../create-context";

export const listSideIncomesProcedure = publicProcedure.query(async ({ ctx }: { ctx: any }) => {
  // TODO: return prisma.sideIncome.findMany({ where: { userId: ... } })
  return { items: [] };
});
