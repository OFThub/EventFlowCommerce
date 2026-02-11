#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DynamoDBStack } from '../lib/dynamodb-stack';
import { EventBridgeStack } from '../lib/eventbridge-stack';
import { SQSStack } from '../lib/sqs-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { StepFunctionsStack } from '../lib/step-functions-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const dynamoDBStack = new DynamoDBStack(app, 'EventFlowDynamoDBStack', { env });
const eventBridgeStack = new EventBridgeStack(app, 'EventFlowEventBridgeStack', { env });
const sqsStack = new SQSStack(app, 'EventFlowSQSStack', { env });

const lambdaStack = new LambdaStack(app, 'EventFlowLambdaStack', {
  env,
  tables: dynamoDBStack.tables,
  eventBus: eventBridgeStack.eventBus,
});

const apiGatewayStack = new ApiGatewayStack(app, 'EventFlowApiGatewayStack', {
  env,
  lambdaFunctions: lambdaStack.functions,
});

new StepFunctionsStack(app, 'EventFlowStepFunctionsStack', {
  env,
  eventBus: eventBridgeStack.eventBus,
});

app.synth();