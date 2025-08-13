import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { chatOpenRouter } from "../../../../ai/openrouter";
import { buildFinanceContext } from "../../../../ai/context";

export const chatProcedure = publicProcedure
  .input(z.object({
    message: z.string().min(1),
    conversationHistory: z.array(z.object({
      role: z.enum(["user","assistant"]),
      content: z.string()
    })).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = (ctx as any)?.user?.id;
    const db = (ctx as any)?.db || (ctx as any)?.prisma;
    const finance = userId && db ? await buildFinanceContext(db, userId) : null;
    
    const system = [
      "You are Masar, a concise personal finance coach for users in Qatar.",
      "Always show money in QAR; keep answers brief, specific, and actionable.",
      finance
        ? `Last 30 days: total QAR ${finance.totalQAR.toFixed(2)} since ${finance.sinceISO}. Top categories: ${finance.topCategories.join(", ")}.`
        : "No recent spend data available yet.",
    ].join(" ");

    const messages = [
      { role: "system" as const, content: system },
      ...(input.conversationHistory ?? []),
      { role: "user" as const, content: input.message },
    ];

    try {
      const content = await chatOpenRouter(messages);
      return { 
        success: true, 
        modelUsed: process.env.AI_MODEL, 
        message: content 
      };
    } catch (error) {
      // Fallback response if AI fails completely
      const fallbackResponse = `I understand you're asking about "${input.message}". While I'm experiencing some technical difficulties, here are some general QAR finance tips: 1) Track all expenses, 2) Set monthly savings goals, 3) Review subscriptions regularly. Please try again in a moment for personalized advice.`;
      
      return {
        success: true,
        modelUsed: "fallback",
        message: fallbackResponse
      };
    }
  });

export default chatProcedure;