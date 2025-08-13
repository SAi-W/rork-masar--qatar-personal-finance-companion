#!/usr/bin/env node

/**
 * CI check: Ensure EXPO_PUBLIC_API_URL starts with https:// for web builds
 * This prevents mixed content issues and ensures secure connections
 */

const fs = require('fs');
const path = require('path');

// Check if we're building for web
const isWebBuild = process.argv.includes('--web') || process.env.PLATFORM === 'web';

if (isWebBuild) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!apiUrl) {
    console.error('❌ EXPO_PUBLIC_API_URL or EXPO_PUBLIC_RORK_API_BASE_URL must be set for web builds');
    process.exit(1);
  }
  
  if (!apiUrl.startsWith('https://')) {
    console.error(`❌ EXPO_PUBLIC_API_URL must start with https:// for web builds. Got: ${apiUrl}`);
    console.error('💡 This prevents mixed content issues and ensures secure connections');
    process.exit(1);
  }
  
  console.log(`✅ API URL is secure: ${apiUrl}`);
} else {
  console.log('ℹ️  Skipping API URL security check for non-web build');
}
