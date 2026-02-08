import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventProjector } from './application/event-projector';
import { EventBus } from '@eventflow/event-bus';
import { ReadModelRepository } from './infrastructure/read-model-repository';

const logger = createLogger('ordering-service');
const PORT = parseInt(process.env.ORDERING_PORT || '3003', 10);

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

    const readModelRepository = new ReadModelRepository();
    const projector = new EventProjector(readModelRepository, eventBus);
    
    await projector.start();
    logger.info('Event projector started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Ordering service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();