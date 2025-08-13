#!/bin/bash

# Setup environment for Neon database
echo "Setting up environment for Neon database..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file with Neon database configuration
cat > .env << EOF
# Neon Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_NsVEelIL8T7O@ep-broad-leaf-abf0x8ze-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Uncomment next line if you use Prisma <5.10
# DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_NsVEelIL8T7O@ep-broad-leaf-abf0x8ze.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Environment
NODE_ENV=development
EOF

echo "✅ Environment file created successfully!"
echo "📝 DATABASE_URL has been set to your Neon database"
echo ""
echo "Next steps:"
echo "1. Run: npm run db:setup"
echo "2. Run: npm run build:api"
echo "3. Run: npm run start:api"
echo ""
echo "For Render deployment, add DATABASE_URL to your environment variables."
