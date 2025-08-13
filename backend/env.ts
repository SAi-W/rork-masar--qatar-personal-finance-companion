import { z } from "zod";

const EnvSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(10, "Set OPENROUTER_API_KEY"),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  AI_MODEL: z.string().default("moonshotai/kimi-k2:free"),
  AI_MODEL_FALLBACK: z.string().default("openai/gpt-4o-mini"),
  APP_URL: z.string().optional(),
  DATABASE_URL: z.string().min(1, "Set DATABASE_URL"),
  JWT_SECRET: z.string().min(1, "Set JWT_SECRET"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const ENV = EnvSchema.parse({
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
  AI_MODEL_FALLBACK: process.env.AI_MODEL_FALLBACK,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});
