import { EventBus } from '@eventflow/event-bus';
import { NotificationService } from './notification-service';
import { createLogger } from '@eventflow/common';

const logger = createLogger('notification-worker');

export class QueueWorker {
  private notificationService: NotificationService;

  constructor(private eventBus: EventBus) {
    this.notificationService = new NotificationService(eventBus);
  }

  async start(): Promise<void> {
    await this.eventBus.consumeFromQueue('notification-queue', this.handleMessage.bind(this));
    logger.info('Started consuming from notification-queue');
  }

  private async handleMessage(message: any): Promise<void> {
    logger.info({ message }, 'Processing notification message');

    try {
      switch (message.type) {
        case 'OrderConfirmed':
          await this.notificationService.sendOrderConfirmation(
            message.orderId,
            message.customerEmail,
            message.correlationId
          );
          break;
        case 'OrderCancelled':
          await this.notificationService.sendOrderCancellation(
            message.orderId,
            message.customerEmail,
            message.correlationId
          );
          break;
        default:
          logger.warn({ type: message.type }, 'Unknown message type');
      }
    } catch (error) {
      logger.error({ error, message }, 'Error processing notification');
    }
  }
}