import type { PrismaClient } from "@prisma/client";

export async function buildFinanceContext(db: PrismaClient, userId?: string) {
  if (!userId) return null;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceISO = since.toISOString(); // <-- String for Prisma String column

  // NOTE: Expense.date is a String in your schema, so we compare with ISO string
  const expenses = await db.expense.findMany({
    where: { userId, date: { gte: sinceISO } }, // <-- string comparison
    select: { amount: true, category: true },    // adjust fields as needed
  });

  const total = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const byCat = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      const k = e.category ?? "other";
      acc[k] = (acc[k] ?? 0) + (e.amount ?? 0);
      return acc;
    }, {})
  ).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return {
    sinceISO,
    totalQAR: Math.round(total * 100) / 100,
    topCategories: byCat.map(([c,v]) => `${c}: QAR ${v.toFixed(2)}`),
  };
}
