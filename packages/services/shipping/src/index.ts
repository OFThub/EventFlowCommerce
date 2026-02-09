import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';
import { ShippingEventHandler } from './application/event-handlers';
import { ShipmentRepository } from './infrastructure/shipment-repository';

const logger = createLogger('shipping-service');
const PORT = parseInt(process.env.SHIPPING_PORT || '3006', 10);

const start = async () => {
  try {
    const eventBus = new EventBus({
      adapter: (process.env.EVENT_BUS_ADAPTER as any) || 'local',
      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        eventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'eventflow-commerce-bus',
        endpoint: process.env.AWS_ENDPOINT_URL,
      },
    });

    const shipmentRepository = new ShipmentRepository();
    const eventHandler = new ShippingEventHandler(shipmentRepository, eventBus);
    
    await eventHandler.start();
    logger.info('Shipping event handler started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Shipping service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();