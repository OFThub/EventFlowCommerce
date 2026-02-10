#!/bin/bash

set -e

echo "🧪 Running tests for EventFlow Commerce"

echo "Running unit tests..."
npm test -- --testPathIgnorePatterns=integration

echo ""
echo "Running integration tests..."
npm test -- integration

echo ""
echo "✅ All tests passed!"