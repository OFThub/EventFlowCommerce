import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { InventoryItem, Reservation } from '../domain/inventory';

export class InventoryRepository {
  private docClient: DynamoDBDocumentClient;
  private inventoryTable: string;
  private reservationsTable: string;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.inventoryTable = process.env.INVENTORY_TABLE || 'inventory';
    this.reservationsTable = process.env.RESERVATIONS_TABLE || 'reservations';
  }

  async saveInventory(inventory: InventoryItem): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.inventoryTable,
        Item: inventory,
      })
    );
  }

  async findByProductId(productId: string): Promise<InventoryItem | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.inventoryTable,
        Key: { productId },
      })
    );
    return (result.Item as InventoryItem) || null;
  }

  async saveReservation(reservation: Reservation): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.reservationsTable,
        Item: reservation,
      })
    );
  }

  async findReservationsByReservationId(reservationId: string): Promise<Reservation[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.reservationsTable,
        IndexName: 'reservationId-index',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': reservationId,
        },
      })
    );
    return (result.Items as Reservation[]) || [];
  }
}