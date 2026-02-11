import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBStack extends cdk.Stack {
  public readonly tables: {
    users: dynamodb.Table;
    products: dynamodb.Table;
    orderEvents: dynamodb.Table;
    orderReadModel: dynamodb.Table;
    payments: dynamodb.Table;
    inventory: dynamodb.Table;
    reservations: dynamodb.Table;
    shipments: dynamodb.Table;
    sagaState: dynamodb.Table;
  };

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.tables = {
      users: new dynamodb.Table(this, 'UsersTable', {
        tableName: 'users',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      products: new dynamodb.Table(this, 'ProductsTable', {
        tableName: 'products',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      orderEvents: new dynamodb.Table(this, 'OrderEventsTable', {
        tableName: 'order-events',
        partitionKey: { name: 'aggregateId', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      orderReadModel: new dynamodb.Table(this, 'OrderReadModelTable', {
        tableName: 'order-read-model',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      payments: new dynamodb.Table(this, 'PaymentsTable', {
        tableName: 'payments',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      inventory: new dynamodb.Table(this, 'InventoryTable', {
        tableName: 'inventory',
        partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      reservations: new dynamodb.Table(this, 'ReservationsTable', {
        tableName: 'reservations',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      shipments: new dynamodb.Table(this, 'ShipmentsTable', {
        tableName: 'shipments',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),

      sagaState: new dynamodb.Table(this, 'SagaStateTable', {
        tableName: 'saga-state',
        partitionKey: { name: 'sagaId', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
    };

    this.tables.users.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.tables.orderReadModel.addGlobalSecondaryIndex({
      indexName: 'customerId-index',
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.tables.sagaState.addGlobalSecondaryIndex({
      indexName: 'orderId-index',
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.tables.reservations.addGlobalSecondaryIndex({
      indexName: 'reservationId-index',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}