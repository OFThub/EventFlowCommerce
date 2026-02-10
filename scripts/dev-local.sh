#!/bin/bash

set -e

echo "🚀 Starting EventFlow Commerce Local Development Environment"

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building packages..."
npm run build

echo "🐳 Starting Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for LocalStack to be ready..."
sleep 15

echo "🔧 Setting up LocalStack resources..."
./scripts/setup-localstack.sh

echo "✅ Infrastructure ready!"
echo ""
echo "📝 Starting services..."
echo ""

# Start services in background
echo "Starting Identity Service..."
cd packages/services/identity && npm start &
PID_IDENTITY=$!

echo "Starting Catalog Service..."
cd ../../.. && cd packages/services/catalog && npm start &
PID_CATALOG=$!

echo "Starting Ordering Service..."
cd ../../.. && cd packages/services/ordering && npm start &
PID_ORDERING=$!

echo "Starting Payment Service..."
cd ../../.. && cd packages/services/payment && npm start &
PID_PAYMENT=$!

echo "Starting Inventory Service..."
cd ../../.. && cd packages/services/inventory && npm start &
PID_INVENTORY=$!

echo "Starting Shipping Service..."
cd ../../.. && cd packages/services/shipping && npm start &
PID_SHIPPING=$!

echo "Starting Notification Service..."
cd ../../.. && cd packages/services/notification && npm start &
PID_NOTIFICATION=$!

echo "Starting Saga Orchestrator..."
cd ../../.. && cd packages/services/saga-orchestrator && npm start &
PID_SAGA=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📌 Service URLs:"
echo "  - Identity:      http://localhost:3001"
echo "  - Catalog:       http://localhost:3002"
echo "  - Ordering:      http://localhost:3003"
echo "  - Payment:       http://localhost:3004"
echo "  - Inventory:     http://localhost:3005"
echo "  - Shipping:      http://localhost:3006"
echo "  - Notification:  http://localhost:3007"
echo "  - Saga:          http://localhost:3008"
echo ""
echo "Press Ctrl+C to stop all services"

cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $PID_IDENTITY $PID_CATALOG $PID_ORDERING $PID_PAYMENT $PID_INVENTORY $PID_SHIPPING $PID_NOTIFICATION $PID_SAGA 2>/dev/null
  docker-compose down
  echo "✅ All services stopped"
  exit 0
}

trap cleanup INT TERM

wait