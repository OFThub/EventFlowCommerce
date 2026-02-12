import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { verifyJWT } from '@eventflow/common';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.ORDER_READ_MODEL_TABLE || 'order-read-model';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] || uuidv4();

  try {
    const token = event.headers.Authorization?.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    verifyJWT(token);

    const orderId = event.pathParameters?.id;
    if (!orderId) {
      return {
        statusCode: 400,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Missing order ID' }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: orderId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Order not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify({
        success: true,
        data: result.Item,
        metadata: {
          correlationId,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error: any) {
    console.error('Error getting order:', error);
    return {
      statusCode: 500,
      headers: { 'x-correlation-id': correlationId },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'ORDER_RETRIEVAL_FAILED',
          message: error.message,
        },
      }),
    };
  }
};