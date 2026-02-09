import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';
import { SagaCoordinator } from './application/saga-coordinator';
import { SagaRepository } from './infrastructure/saga-repository';

const logger = createLogger('saga-orchestrator');
const PORT = parseInt(process.env.SAGA_PORT || '3008', 10);

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

    const sagaRepository = new SagaRepository();
    const coordinator = new SagaCoordinator(sagaRepository, eventBus);
    
    await coordinator.start();
    logger.info('Saga coordinator started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Saga orchestrator listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();