import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signJWT } from '@eventflow/common';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.USERS_TABLE || 'users';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] || uuidv4();

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      })
    );

    const user = result.Items?.[0];
    if (!user) {
      return {
        statusCode: 401,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return {
        statusCode: 401,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    const token = signJWT({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify({
        success: true,
        data: {
          userId: user.id,
          token,
        },
        metadata: {
          correlationId,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error: any) {
    console.error('Error logging in:', error);
    return {
      statusCode: 500,
      headers: { 'x-correlation-id': correlationId },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message,
        },
      }),
    };
  }
};