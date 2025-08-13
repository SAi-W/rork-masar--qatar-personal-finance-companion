#!/bin/bash

echo "=== tRPC Debug Information ==="
echo ""

# Check if backend is running
echo "1. Backend Port and Status:"
echo "   Default Rork backend port: 3000"
echo "   Backend URL: ${EXPO_PUBLIC_API:-https://ngdunkr400vr2etysza50.rork.com/api}"
echo ""

# Test health endpoint
echo "2. Testing API Health Endpoint:"
curl -s -w "Status: %{http_code}\n" "${EXPO_PUBLIC_API:-https://ngdunkr400vr2etysza50.rork.com/api}/health" || echo "Failed to connect"
echo ""

# Test tRPC endpoint with correct format
echo "3. Testing tRPC Endpoint (example.hi):"
curl -i -X POST "${EXPO_PUBLIC_API:-https://ngdunkr400vr2etysza50.rork.com/api}/trpc/example.hi" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '[{"id":"1","json":{"name":"Test User"}}]' || echo "Failed to connect"
echo ""

# Test tRPC batch format
echo "4. Testing tRPC Batch Format:"
curl -i -X POST "${EXPO_PUBLIC_API:-https://ngdunkr400vr2etysza50.rork.com/api}/trpc" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data '{"0":{"json":{"name":"Batch Test"},"meta":{"values":{"name":["undefined"]}}}}' || echo "Failed to connect"
echo ""

# Environment variables
echo "5. Environment Configuration:"
echo "   EXPO_PUBLIC_API: ${EXPO_PUBLIC_API:-'Not set'}"
echo ""

echo "6. Network Configuration:"
echo "   For Android Emulator: Use http://10.0.2.2:3000"
echo "   For iOS Simulator: Use http://localhost:3000"
echo "   For Physical Device: Use http://<YOUR_LAN_IP>:3000"
echo ""

echo "=== End Debug Information ==="