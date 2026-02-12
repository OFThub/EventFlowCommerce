import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.PRODUCTS_TABLE || 'products';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] || uuidv4();

  try {
    const category = event.queryStringParameters?.category;

    const params: any = {
      TableName: tableName,
    };

    if (category) {
      params.FilterExpression = 'category = :category';
      params.ExpressionAttributeValues = { ':category': category };
    }

    const result = await docClient.send(new ScanCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify({
        success: true,
        data: result.Items || [],
        metadata: {
          correlationId,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error: any) {
    console.error('Error getting catalog:', error);
    return {
      statusCode: 500,
      headers: { 'x-correlation-id': correlationId },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'CATALOG_RETRIEVAL_FAILED',
          message: error.message,
        },
      }),
    };
  }
};