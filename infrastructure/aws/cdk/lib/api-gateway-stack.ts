import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends cdk.StackProps {
  lambdaFunctions: {
    ordersPost: lambda.Function;
    ordersGet: lambda.Function;
    catalogGet: lambda.Function;
    authLogin: lambda.Function;
  };
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    this.api = new apigateway.RestApi(this, 'EventFlowApi', {
      restApiName: 'EventFlow Commerce API',
      description: 'API Gateway for EventFlow Commerce',
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
      },
    });

    const auth = this.api.root.addResource('auth');
    auth.addResource('login').addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.lambdaFunctions.authLogin)
    );

    const catalog = this.api.root.addResource('catalog');
    catalog.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.catalogGet)
    );

    const orders = this.api.root.addResource('orders');
    orders.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.lambdaFunctions.ordersPost)
    );

    const orderById = orders.addResource('{id}');
    orderById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.ordersGet)
    );

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });
  }
}