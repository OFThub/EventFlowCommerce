import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';
import { InventoryEventHandler } from './application/event-handlers';
import { InventoryRepository } from './infrastructure/inventory-repository';

const logger = createLogger('inventory-service');
const PORT = parseInt(process.env.INVENTORY_PORT || '3005', 10);

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

    const inventoryRepository = new InventoryRepository();
    const eventHandler = new InventoryEventHandler(inventoryRepository, eventBus);
    
    await eventHandler.start();
    logger.info('Inventory event handler started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Inventory service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();