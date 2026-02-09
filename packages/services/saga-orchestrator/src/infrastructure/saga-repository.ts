import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SagaState } from '../saga/saga-state';

export class SagaRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.SAGA_STATE_TABLE || 'saga-state';
  }

  async save(sagaState: SagaState): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: sagaState,
      })
    );
  }

  async findByOrderId(orderId: string): Promise<SagaState | null> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'orderId-index',
        KeyConditionExpression: 'orderId = :orderId',
        ExpressionAttributeValues: {
          ':orderId': orderId,
        },
      })
    );
    return (result.Items?.[0] as SagaState) || null;
  }
}