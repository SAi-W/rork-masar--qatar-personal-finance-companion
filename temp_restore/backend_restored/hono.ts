import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// app will be mounted at /api
const app = new Hono();

console.log('[Startup] Hono server starting...');
console.log('[Startup] Environment:', process.env.NODE_ENV || 'development');

// Add request logging middleware BEFORE CORS
app.use('*', async (c, next) => {
  console.log(new Date().toISOString(), c.req.method, c.req.path);
  return next();
});

// Enhanced CORS for preview environments
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    const allow = [
      'http://localhost:19006',
      'http://localhost:3000',
      'http://localhost:8081',
      '.expo.dev',
      '.expo.dev:',
      'onrender.com',
      '.rork.dev',
      '.rork.run'
    ];
    return allow.some(s => origin.endsWith(s) || origin.includes(s)) ? origin : 'https://masar.app';
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
  credentials: true,
  maxAge: 86400,
}));

// Mount tRPC router at /api/trpc
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path, input }: { error: any; path?: string; input: any }) => {
      console.error(`[tRPC] Error on ${path || 'unknown'}:`, error.message);
      console.error('[tRPC] Error details:', {
        code: error.code,
        cause: error.cause,
        input: input
      });
    },
  })
);

// Add a test endpoint to verify tRPC is mounted correctly
app.all("/api/trpc-test", async (c) => {
  console.log('[Test] tRPC test endpoint hit with method:', c.req.method);
  return c.json({
    message: "tRPC mount test successful",
    method: c.req.method,
    timestamp: new Date().toISOString(),
    path: "/api/trpc-test",
    headers: c.req.header()
  });
});

// Simple health check endpoint
app.get("/", (c) => {
  console.log('[Health] Root endpoint hit');
  return c.json({
    status: "ok",
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Add health endpoint for better testing
app.get("/health", (c) => {
  console.log('[Health] Health endpoint hit');
  return c.json({
    status: "healthy",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime()
  });
});

// Add API health endpoint
app.get("/api/health", (c) => {
  console.log('[Health] API health endpoint hit');
  return c.json({
    status: "healthy",
    message: "API server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: process.uptime(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      test: "/api/trpc-test"
    }
  });
});

// Add a test endpoint to verify the server is working
app.get("/test", async (c) => {
  console.log('[Test] Test endpoint hit');
  return c.json({
    message: "Backend test endpoint working",
    timestamp: new Date().toISOString(),
    path: "/test"
  });
});

// Add ping endpoint for simple health checks
app.get("/ping", (c) => {
  console.log('[Ping] Ping endpoint hit');
  return c.json({
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

console.log('[Startup] Hono server configured and ready');
console.log('[Startup] Available endpoints:');
console.log('[Startup] - GET / (health)');
console.log('[Startup] - GET /health');
console.log('[Startup] - GET /api/health');
console.log('[Startup] - GET /ping');
console.log('[Startup] - POST /api/trpc-test');
console.log('[Startup] - POST /api/trpc/* (tRPC endpoints)');

export default app;
