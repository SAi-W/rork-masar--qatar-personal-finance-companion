# Render Deployment Guide for Masar Backend

## 🚀 Quick Fixes for Common 500 Errors

### 1. Database Schema Not Applied (Most Common)
Your server boots, but if tables aren't there, Prisma will 500 on the first write.

**In Render → your service → Pre-Deploy Command, set:**
```bash
npx prisma migrate deploy --schema=db/schema.prisma
```

**Redeploy.**

If you don't have migrations yet, do a one-time sync (dev stopgap):
```bash
npx prisma db push --schema=db/schema.prisma
```
(Run from Render Shell or locally against the same DB, then redeploy. Later, create proper migrations.)

### 2. Missing JWT_SECRET (Not Needed for Your Setup)
Your auth routes use `nanoid` for tokens, not JWT, so you don't need JWT_SECRET.

### 3. Duplicate Email (Prisma P2002)
Registering an already-existing email throws and becomes a 500 unless you catch it.

**Try with a fresh email to confirm.**

**Add handler (already implemented):**
```typescript
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

try {
  // prisma.user.create({ ... })
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' });
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
}
```

## 🔧 Render Service Configuration

### Root Directory
Set to: `backend`

### Build Command
```bash
npm ci --include=dev && npx prisma generate --schema=db/schema.prisma && npm run build:api
```

### Start Command
```bash
npm run start:api
```

### Health Check Path
```
/health
```

### Pre-Deploy Command
```bash
npx prisma migrate deploy --schema=db/schema.prisma
```

## 🗄️ Neon Database Configuration

### Environment Variables
**In Render → Environment, add:**
```
DATABASE_URL=postgresql://neondb_owner:npg_NsVEelIL8T7O@ep-broad-leaf-abf0x8ze-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Optional (for Prisma <5.10):**
```
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_NsVEelIL8T7O@ep-broad-leaf-abf0x8ze.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Database Setup
1. **First deployment**: Use `npx prisma db push --schema=db/schema.prisma` in Pre-Deploy Command
2. **Subsequent deployments**: Use `npx prisma migrate deploy --schema=db/schema.prisma`
3. **Local development**: Copy `backend/env.example` to `backend/.env`

### Neon-Specific Notes
- Uses **PostgreSQL** provider (not SQLite)
- **Connection pooling** enabled via pooler URL
- **SSL required** (`sslmode=require`)
- **Channel binding** required for security

## 📱 Frontend Configuration

### EAS Build Environment
Your `eas.json` is already configured:
- **Development**: `http://192.168.100.114:3000`
- **Production**: `https://rork-masar-qatar-personal-finance.onrender.com`

### API Constants
Your `lib/api.ts` exports:
- `API_URL`: Environment-based API URL
- `healthCheck()`: Health check function
- `ping()`: Connectivity test function

### tRPC Client
Your `lib/trpc.ts` correctly points to:
- `${API_URL}/api/trpc` (not just `/trpc`)

## 🧪 Testing Steps

### 1. Health Check
```bash
curl https://rork-masar-qatar-personal-finance.onrender.com/health
# Expected: {"ok": true}
```

### 2. tRPC Endpoint
```bash
curl https://rork-masar-qatar-personal-finance.onrender.com/api/trpc-test
# Expected: {"message": "tRPC mount test successful", ...}
```

### 3. Registration Test
Try registering with a **fresh email** (not previously used).

### 4. Database Connection Test
Check Render logs for:
- ✅ `[DB] Prisma client initialized`
- ✅ No database connection errors

## 🚨 Troubleshooting

### Get the Exact Reason in 30 Seconds
1. Open Render → Logs
2. Hit register again
3. Look for one of these errors:

**P2021: Table does not exist**
→ Run migrations/db push (Step 1)

**P2002: Duplicate email**
→ Use a fresh email (Step 3)

**Database connection errors**
→ Check DATABASE_URL environment variable
→ Verify Neon database is accessible

**Other errors**
→ Check the specific error message in logs

### Quick Sanity Checklist
- ✅ Expo build uses `EXPO_PUBLIC_API_URL=https://rork-masar-qatar-personal-finance.onrender.com`
- ✅ tRPC client hits `/api/trpc` (not `/trpc`)
- ✅ Health is green at `/health`
- ✅ Pre-deploy command runs Prisma migrations
- ✅ Build includes dev dependencies
- ✅ DATABASE_URL environment variable is set
- ✅ Neon database is accessible

## 📦 Production Build

```bash
# Build production app with baked-in EXPO_PUBLIC_API_URL
eas build -p ios --profile production
```

## 🔄 After Making Changes

1. **Commit and push** your changes
2. **Set DATABASE_URL** in Render Environment
3. **Redeploy** on Render
4. **Test** with a fresh email
5. **Check logs** if issues persist

## 📞 Support

If you still get 500s after following these steps:
1. Check Render logs for the exact error
2. Paste the single error line from logs
3. I'll provide the exact patch needed
