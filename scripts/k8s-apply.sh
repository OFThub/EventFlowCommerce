#!/bin/bash

set -e

echo "☸️  Deploying EventFlow Commerce to Kubernetes"

echo "Creating namespace..."
kubectl apply -f infrastructure/kubernetes/namespace.yaml

echo "Applying Istio configurations..."
kubectl apply -f infrastructure/kubernetes/istio/

echo "Deploying services..."
kubectl apply -f infrastructure/kubernetes/services/

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/identity-service \
  deployment/catalog-service \
  deployment/ordering-service-v1 \
  deployment/payment-service \
  deployment/inventory-service \
  deployment/shipping-service \
  deployment/notification-service \
  deployment/saga-orchestrator \
  -n eventflow

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Get Istio Gateway IP:"
echo "  kubectl get svc istio-ingressgateway -n istio-system"
echo ""
echo "View services:"
echo "  kubectl get pods -n eventflow"
echo "  kubectl get svc -n eventflow"