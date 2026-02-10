#!/bin/bash

set -e

echo "🔧 Setting up LocalStack resources..."

export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
ENDPOINT=http://localhost:4566

echo "Creating DynamoDB tables..."

# Users table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Products table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name products \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Order events table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name order-events \
  --attribute-definitions \
    AttributeName=aggregateId,AttributeType=S \
    AttributeName=version,AttributeType=N \
  --key-schema \
    AttributeName=aggregateId,KeyType=HASH \
    AttributeName=version,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Order read model table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name order-read-model \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=customerId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=customerId-index,KeySchema=[{AttributeName=customerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Payments table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name payments \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Inventory table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name inventory \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Reservations table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name reservations \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Shipments table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name shipments \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

# Saga state table
aws dynamodb create-table \
  --endpoint-url $ENDPOINT \
  --table-name saga-state \
  --attribute-definitions \
    AttributeName=sagaId,AttributeType=S \
    AttributeName=orderId,AttributeType=S \
  --key-schema \
    AttributeName=sagaId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=orderId-index,KeySchema=[{AttributeName=orderId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST \
  --region $AWS_REGION || true

echo "Creating EventBridge event bus..."
aws events create-event-bus \
  --endpoint-url $ENDPOINT \
  --name eventflow-commerce-bus \
  --region $AWS_REGION || true

echo "Creating SQS queues..."
aws sqs create-queue \
  --endpoint-url $ENDPOINT \
  --queue-name notification-queue \
  --region $AWS_REGION || true

echo "Seeding sample data..."

# Add sample products
aws dynamodb put-item \
  --endpoint-url $ENDPOINT \
  --table-name products \
  --item '{
    "id": {"S": "prod-1"},
    "name": {"S": "Laptop"},
    "description": {"S": "High-performance laptop"},
    "price": {"N": "1299.99"},
    "category": {"S": "Electronics"},
    "stock": {"N": "50"},
    "createdAt": {"S": "2024-01-01T00:00:00Z"},
    "updatedAt": {"S": "2024-01-01T00:00:00Z"}
  }' \
  --region $AWS_REGION || true

aws dynamodb put-item \
  --endpoint-url $ENDPOINT \
  --table-name products \
  --item '{
    "id": {"S": "prod-2"},
    "name": {"S": "Mouse"},
    "description": {"S": "Wireless mouse"},
    "price": {"N": "29.99"},
    "category": {"S": "Electronics"},
    "stock": {"N": "100"},
    "createdAt": {"S": "2024-01-01T00:00:00Z"},
    "updatedAt": {"S": "2024-01-01T00:00:00Z"}
  }' \
  --region $AWS_REGION || true

# Add inventory for products
aws dynamodb put-item \
  --endpoint-url $ENDPOINT \
  --table-name inventory \
  --item '{
    "productId": {"S": "prod-1"},
    "availableStock": {"N": "50"},
    "reservedStock": {"N": "0"},
    "updatedAt": {"S": "2024-01-01T00:00:00Z"}
  }' \
  --region $AWS_REGION || true

aws dynamodb put-item \
  --endpoint-url $ENDPOINT \
  --table-name inventory \
  --item '{
    "productId": {"S": "prod-2"},
    "availableStock": {"N": "100"},
    "reservedStock": {"N": "0"},
    "updatedAt": {"S": "2024-01-01T00:00:00Z"}
  }' \
  --region $AWS_REGION || true

echo "✅ LocalStack setup complete!"