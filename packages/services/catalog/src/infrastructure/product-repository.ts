import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '../domain/product';

export class ProductRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.PRODUCTS_TABLE || 'products';
  }

  async save(product: Product): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: product,
      })
    );
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );
    return (result.Item as Product) || null;
  }

  async findAll(category?: string): Promise<Product[]> {
    const params: any = {
      TableName: this.tableName,
    };

    if (category) {
      params.FilterExpression = 'category = :category';
      params.ExpressionAttributeValues = { ':category': category };
    }

    const result = await this.docClient.send(new ScanCommand(params));
    return (result.Items as Product[]) || [];
  }
}