import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaStackProps extends cdk.StackProps {
  tables: {
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
  eventBus: events.EventBus;
}

export class LambdaStack extends cdk.Stack {
  public readonly functions: {
    ordersPost: lambda.Function;
    ordersGet: lambda.Function;
    catalogGet: lambda.Function;
    authLogin: lambda.Function;
  };

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const commonEnvironment = {
      AWS_REGION: this.region,
      EVENTBRIDGE_BUS_NAME: props.eventBus.eventBusName,
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    };

    this.functions = {
      ordersPost: new lambda.Function(this, 'OrdersPostFunction', {
        functionName: 'eventflow-orders-post',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../../lambda/orders-post/dist')),
        timeout: cdk.Duration.seconds(30),
        environment: {
          ...commonEnvironment,
          EVENT_STORE_TABLE: props.tables.orderEvents.tableName,
        },
      }),

      ordersGet: new lambda.Function(this, 'OrdersGetFunction', {
        functionName: 'eventflow-orders-get',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../../lambda/orders-get/dist')),
        timeout: cdk.Duration.seconds(30),
        environment: {
          ...commonEnvironment,
          ORDER_READ_MODEL_TABLE: props.tables.orderReadModel.tableName,
        },
      }),

      catalogGet: new lambda.Function(this, 'CatalogGetFunction', {
        functionName: 'eventflow-catalog-get',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../../lambda/catalog-get/dist')),
        timeout: cdk.Duration.seconds(30),
        environment: {
          ...commonEnvironment,
          PRODUCTS_TABLE: props.tables.products.tableName,
        },
      }),

      authLogin: new lambda.Function(this, 'AuthLoginFunction', {
        functionName: 'eventflow-auth-login',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../../lambda/auth-login/dist')),
        timeout: cdk.Duration.seconds(30),
        environment: {
          ...commonEnvironment,
          USERS_TABLE: props.tables.users.tableName,
        },
      }),
    };

    props.tables.orderEvents.grantReadWriteData(this.functions.ordersPost);
    props.tables.orderReadModel.grantReadData(this.functions.ordersGet);
    props.tables.products.grantReadData(this.functions.catalogGet);
    props.tables.users.grantReadData(this.functions.authLogin);

    props.eventBus.grantPutEventsTo(this.functions.ordersPost);

    Object.values(this.functions).forEach((fn) => {
      new cdk.CfnOutput(this, `${fn.functionName}Arn`, {
        value: fn.functionArn,
        description: `${fn.functionName} ARN`,
      });
    });
  }
}