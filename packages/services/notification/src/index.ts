import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';
import { QueueWorker } from './application/queue-worker';

const logger = createLogger('notification-service');
const PORT = parseInt(process.env.NOTIFICATION_PORT || '3007', 10);

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

    const worker = new QueueWorker(eventBus);
    await worker.start();
    logger.info('Notification queue worker started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Notification service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();