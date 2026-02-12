import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { verifyJWT } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';

const eventBus = new EventBus({
  adapter: 'eventbridge',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    eventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'eventflow-commerce-bus',
  },
});

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

    const user = verifyJWT(token);
    const body = JSON.parse(event.body || '{}');

    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'x-correlation-id': correlationId },
        body: JSON.stringify({ error: 'Invalid items' }),
      };
    }

    const orderId = uuidv4();
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const createOrderEvent = {
      eventId: uuidv4(),
      type: 'OrderCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId,
      payload: {
        customerId: user.userId,
        items,
        shippingAddress,
        totalAmount,
      },
    };

    await eventBus.publish(createOrderEvent);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify({
        success: true,
        data: { orderId },
        metadata: {
          correlationId,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers: { 'x-correlation-id': correlationId },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: error.message,
        },
      }),
    };
  }
};