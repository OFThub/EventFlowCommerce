# EventFlowCommerce

A complete, production-lean reference implementation of event-driven microservices architecture demonstrating Domain-Driven Design, Event Sourcing, CQRS, Saga Pattern, and Service Mesh concepts.

## Architecture Overview

### Bounded Contexts (DDD)

1. **Identity BC**: User authentication and authorization (JWT-based)
2. **Catalog BC**: Product catalog management
3. **Ordering BC**: Order management with Event Sourcing + CQRS
4. **Payment BC**: Payment authorization and capture
5. **Inventory BC**: Stock reservation and management
6. **Shipping BC**: Shipment creation and tracking
7. **Notification BC**: Async notification processing via message queue

### Key Patterns Demonstrated

#### Event-Driven Architecture
- **Event Bus Abstraction**: Common interface with adapters for:
  - AWS EventBridge
  - Google Cloud Pub/Sub
  - Local in-memory adapter (for development)
- **Pub/Sub Pattern**: Services communicate via domain events
- **Message Queue**: Work queue semantics for notifications (SQS)

#### Event Sourcing + CQRS
- **Ordering BC** implements full event sourcing:
  - Write model: Event-sourced aggregate storing events in DynamoDB
  - Event Store: Append-only with optimistic concurrency
  - Read model: Projected views for queries
  - Separate command and query paths

#### Saga Pattern (Distributed Transactions)
- **PlaceOrderSaga** orchestrates distributed transaction:
  - Steps: Reserve Inventory → Authorize Payment → Create Shipment → Complete Order
  - Compensations on failure: Cancel Payment → Release Inventory → Cancel Shipment → Mark Order Cancelled
  - Implementation: Local orchestrator (AWS Step Functions definition included)

#### API Gateway Pattern
- **External Edge**: AWS API Gateway + Lambda for public endpoints
- **Internal Gateway**: Kubernetes Istio Gateway for service mesh

#### Service Mesh (Istio)
- mTLS for service-to-service communication
- Traffic splitting (canary deployments)
- Retries, timeouts, circuit breaking
- Distributed tracing header propagation

### Technology Stack

- **Runtime**: Node.js 20+, TypeScript
- **HTTP Framework**: Fastify
- **Persistence**: DynamoDB (via LocalStack locally)
- **Messaging**: EventBridge, Pub/Sub, SQS
- **Serverless**: AWS Lambda + API Gateway
- **Orchestration**: Kubernetes + Istio
- **IaC**: AWS CDK
- **Local Dev**: Docker Compose + LocalStack

## Project Structureeventflow-commerce/
├── packages/
│   ├── event-bus/          # Event bus abstraction + adapters
│   ├── common/             # Shared utilities (logger, correlation, JWT)
│   └── services/           # Microservices (one per BC)
│       ├── identity/
│       ├── catalog/
│       ├── ordering/       # Event Sourcing + CQRS implementation
│       ├── payment/
│       ├── inventory/
│       ├── shipping/
│       ├── notification/
│       └── saga-orchestrator/  # Saga coordinator
├── lambda/                 # AWS Lambda handlers
│   ├── orders-post/
│   ├── orders-get/
│   ├── catalog-get/
│   └── auth-login/
├── infrastructure/
│   ├── aws/               # AWS CDK stacks
│   └── kubernetes/        # K8s + Istio manifests
└── scripts/               # Automation scripts

## How to Run Locally

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

### One-Command Startup
```bashnpm install
npm run dev:local

This will:
1. Start LocalStack (DynamoDB, SQS, EventBridge)
2. Start Pub/Sub emulator
3. Initialize LocalStack resources
4. Build all packages
5. Start all microservices

### Manual Steps
```bashInstall dependencies
npm installStart infrastructure
docker-compose up -dWait for LocalStack to be ready
sleep 10Build packages
npm run buildStart services (in separate terminals)
cd packages/services/identity && npm start
cd packages/services/catalog && npm start
cd packages/services/ordering && npm start
cd packages/services/payment && npm start
cd packages/services/inventory && npm start
cd packages/services/shipping && npm start
cd packages/services/notification && npm start
cd packages/services/saga-orchestrator && npm start

### Testing the System
```bashRun all tests
npm testIntegration test (end-to-end happy path)
npm test -- integrationTest specific service
cd packages/services/ordering && npm test

### Example API Calls
```bashLogin to get JWT
curl -X POST http://localhost:3001/auth/login 
-H "Content-Type: application/json" 
-d '{"username": "user@example.com", "password": "password"}'Get catalog
curl http://localhost:3002/catalogCreate order
curl -X POST http://localhost:3003/orders 
-H "Content-Type: application/json" 
-H "Authorization: Bearer <JWT_TOKEN>" 
-H "x-correlation-id: $(uuidgen)" 
-d '{
"items": [
{"productId": "prod-1", "quantity": 2}
],
"customerId": "customer-1",
"shippingAddress": {
"street": "123 Main St",
"city": "Seattle",
"state": "WA",
"zip": "98101"
}
}'Get order status
curl http://localhost:3003/orders/{orderId} 
-H "Authorization: Bearer <JWT_TOKEN>"

## How to Deploy to AWS

### Prerequisites

- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- AWS account with appropriate permissions

### Deploy
```bashnpm run deploy:aws

This will deploy:
- DynamoDB tables (orders, events, read models)
- EventBridge event bus
- SQS queues
- Lambda functions
- API Gateway with OpenAPI spec
- Step Functions state machine for saga
- IAM roles and policies

### Configuration

Edit `infrastructure/aws/cdk/bin/app.ts` to configure:
- AWS account and region
- Stack names
- Resource naming

### Accessing Deployed APIs

After deployment, CDK will output API Gateway URLs:ApiGatewayStack.ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

## How to Run on Kubernetes with Istio

### Prerequisites

- Kubernetes cluster (EKS, GKE, or local kind/minikube)
- kubectl configured
- Istio installed on cluster

### Install Istio (if not already installed)
```bashDownload Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=PWD/bin:PWD/bin:
PWD/bin:PATH
Install Istio
istioctl install --set profile=demo -yEnable sidecar injection
kubectl label namespace default istio-injection=enabled

### Deploy Services
```bashnpm run k8s:apply

This will:
1. Create `eventflow` namespace
2. Deploy all microservices
3. Configure Istio Gateway for ingress
4. Set up VirtualServices with traffic splitting
5. Configure DestinationRules for canary deployments
6. Enable mTLS with PeerAuthentication

### Access Services
```bashGet Istio Gateway external IP
kubectl get svc istio-ingressgateway -n istio-systemAccess via gateway
curl http://<EXTERNAL-IP>/catalog

### Canary Deployment Example

The Ordering service is configured with 90/10 traffic split:
- 90% to v1 (stable)
- 10% to v2 (canary)

Modify `infrastructure/kubernetes/istio/destination-rule.yaml` to adjust weights.

### Observability
```bashView logs with correlation ID
kubectl logs -f deployment/ordering -n eventflow | grep correlationIstio metrics
kubectl port-forward -n istio-system svc/prometheus 9090:9090Istio tracing (Jaeger)
kubectl port-forward -n istio-system svc/tracing 16686:16686Kiali dashboard
kubectl port-forward -n istio-system svc/kiali 20001:20001

## Architecture Mappings

### Requirement → Implementation

| Requirement | Implementation Path |
|-------------|-------------------|
| **DDD Bounded Contexts** | `packages/services/{identity,catalog,ordering,payment,inventory,shipping,notification}/domain/` |
| **Event Bus Abstraction** | `packages/event-bus/src/adapters/{eventbridge,pubsub,local}-adapter.ts` |
| **Event Sourcing** | `packages/services/ordering/infrastructure/event-store.ts` |
| **CQRS** | `packages/services/ordering/application/{order-command-handler,order-query-handler}.ts` |
| **Saga Pattern** | `packages/services/saga-orchestrator/saga/place-order-saga.ts` |
| **Compensations** | `packages/services/saga-orchestrator/saga/compensation.ts` |
| **API Gateway (AWS)** | `lambda/*/src/index.ts` + `infrastructure/aws/api-gateway/openapi.yaml` |
| **Service Mesh** | `infrastructure/kubernetes/istio/*.yaml` |
| **Canary Deployment** | `infrastructure/kubernetes/istio/destination-rule.yaml` (weight-based routing) |
| **mTLS** | `infrastructure/kubernetes/istio/peer-authentication.yaml` |
| **Message Queue** | `packages/services/notification/application/queue-worker.ts` (SQS consumer) |
| **Correlation ID** | `packages/common/src/correlation.ts` + middleware in all services |
| **Observability** | Structured logging in `packages/common/src/logger.ts` |

## Testing Strategy

### Unit Tests
- Domain logic (aggregates, value objects): `packages/services/ordering/tests/order-aggregate.test.ts`
- Saga compensation logic: `packages/services/saga-orchestrator/tests/saga.test.ts`

### Integration Tests
- End-to-end happy path: `packages/services/ordering/tests/integration.test.ts`
- Spins up LocalStack
- Validates order creation → inventory reservation → payment → shipment → completion

### Running Tests
```bashAll tests
npm testSpecific test file
npm test -- order-aggregate.test.tsWatch mode
npm test -- --watchCoverage
npm test -- --coverage

## Event Flow Example: Place Order

1. **API Gateway** receives `POST /orders`
2. **Lambda** (orders-post) validates and publishes `CreateOrderCommand`
3. **Ordering Service** (write side):
   - Creates `Order` aggregate
   - Appends `OrderCreated` event to event store
   - Publishes event to EventBridge
4. **Saga Orchestrator** receives `OrderCreated`:
   - Starts `PlaceOrderSaga`
   - Step 1: Publishes `ReserveInventory` command
5. **Inventory Service**:
   - Reserves stock
   - Publishes `InventoryReserved` event
6. **Saga Orchestrator** receives `InventoryReserved`:
   - Step 2: Publishes `AuthorizePayment` command
7. **Payment Service**:
   - Authorizes payment
   - Publishes `PaymentAuthorized` event
8. **Saga Orchestrator** receives `PaymentAuthorized`:
   - Step 3: Publishes `CreateShipment` command
9. **Shipping Service**:
   - Creates shipment
   - Publishes `ShipmentCreated` event
10. **Saga Orchestrator** receives `ShipmentCreated`:
    - Step 4: Publishes `CompleteOrder` command
11. **Ordering Service** (write side):
    - Appends `OrderCompleted` event
12. **Ordering Service** (read side):
    - Projects `OrderCompleted` event to read model
13. **Notification Service**:
    - Receives event via SQS queue
    - Sends confirmation email

### Failure & Compensation

If Payment authorization fails:
1. Saga publishes `CancelPayment` (no-op if not authorized)
2. Saga publishes `ReleaseInventory` → Inventory releases reservation
3. Saga publishes `CancelOrder` → Order marked as cancelled

## Configuration

### Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `EVENT_BUS_ADAPTER`: `local` | `eventbridge` | `pubsub`
- `AWS_ENDPOINT_URL`: LocalStack endpoint (local dev)
- `JWT_SECRET`: Signing secret for JWT tokens

### Switching Event Bus Adapters
```bashLocal development
EVENT_BUS_ADAPTER=local npm run dev:localAWS EventBridge
EVENT_BUS_ADAPTER=eventbridge npm startGoogle Pub/Sub
EVENT_BUS_ADAPTER=pubsub npm start

## Security

### Local Development
- Uses shared JWT secret (HS256)
- LocalStack requires no authentication

### Production
- Use AWS Secrets Manager for JWT secrets
- EventBridge uses IAM roles
- API Gateway uses Cognito/Lambda authorizers
- Istio mTLS for service-to-service
- Network policies to restrict traffic

## Monitoring & Observability

### Structured Logging
All services emit JSON logs with:
- `correlationId`: Request trace ID
- `timestamp`: ISO 8601
- `level`: info, warn, error
- `service`: Service name