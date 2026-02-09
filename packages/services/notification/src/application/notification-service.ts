import { v4 as uuidv4 } from 'uuid';
import { EmailSender } from '../infrastructure/email-sender';
import { EventBus } from '@eventflow/event-bus';
import { NotificationSentEvent } from '../domain/events';

export class NotificationService {
  private emailSender: EmailSender;

  constructor(private eventBus: EventBus) {
    this.emailSender = new EmailSender();
  }

  async sendOrderConfirmation(orderId: string, customerEmail: string, correlationId: string): Promise<void> {
    await this.emailSender.send(
      customerEmail,
      'Order Confirmation',
      `Your order ${orderId} has been confirmed.`
    );

    const event: NotificationSentEvent = {
      eventId: uuidv4(),
      type: 'NotificationSent',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId,
      payload: {
        recipient: customerEmail,
        subject: 'Order Confirmation',
        channel: 'email',
      },
    };

    await this.eventBus.publish(event);
  }

  async sendOrderCancellation(orderId: string, customerEmail: string, correlationId: string): Promise<void> {
    await this.emailSender.send(
      customerEmail,
      'Order Cancelled',
      `Your order ${orderId} has been cancelled.`
    );

    const event: NotificationSentEvent = {
      eventId: uuidv4(),
      type: 'NotificationSent',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId,
      payload: {
        recipient: customerEmail,
        subject: 'Order Cancelled',
        channel: 'email',
      },
    };

    await this.eventBus.publish(event);
  }
}