import { createServer } from './server';
import { createLogger } from '@eventflow/common';
import { EventBus } from '@eventflow/event-bus';
import { PaymentEventHandler } from './application/event-handlers';
import { PaymentRepository } from './infrastructure/payment-repository';

const logger = createLogger('payment-service');
const PORT = parseInt(process.env.PAYMENT_PORT || '3004', 10);

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

    const paymentRepository = new PaymentRepository();
    const eventHandler = new PaymentEventHandler(paymentRepository, eventBus);
    
    await eventHandler.start();
    logger.info('Payment event handler started');

    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Payment service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();