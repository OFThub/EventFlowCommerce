import { v4 as uuidv4 } from 'uuid';
import { PaymentAggregate, Payment } from '../domain/payment';
import { PaymentRepository } from '../infrastructure/payment-repository';
import { EventBus } from '@eventflow/event-bus';
import { PaymentAuthorizedEvent, PaymentCancelledEvent, PaymentFailedEvent } from '../domain/events';

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private eventBus: EventBus
  ) {}

  async authorizePayment(orderId: string, amount: number, correlationId: string): Promise<Payment> {
    const paymentId = uuidv4();
    const payment = PaymentAggregate.create(paymentId, orderId, amount);

    try {
      await this.simulatePaymentGateway(amount);
      payment.authorize();

      await this.paymentRepository.save(payment.toDTO());

      const event: PaymentAuthorizedEvent = {
        eventId: uuidv4(),
        type: 'PaymentAuthorized',
        occurredAt: new Date().toISOString(),
        aggregateId: paymentId,
        version: 1,
        correlationId,
        payload: {
          orderId,
          amount,
          authorizationCode: payment.authorizationCode!,
        },
      };

      await this.eventBus.publish(event);

      return payment.toDTO();
    } catch (error: any) {
      payment.fail();
      await this.paymentRepository.save(payment.toDTO());

      const event: PaymentFailedEvent = {
        eventId: uuidv4(),
        type: 'PaymentFailed',
        occurredAt: new Date().toISOString(),
        aggregateId: paymentId,
        version: 1,
        correlationId,
        payload: {
          orderId,
          reason: error.message,
        },
      };

      await this.eventBus.publish(event);

      throw error;
    }
  }

  async cancelPayment(paymentId: string, correlationId: string): Promise<void> {
    const paymentData = await this.paymentRepository.findById(paymentId);
    if (!paymentData) {
      throw new Error('Payment not found');
    }

    const payment = new PaymentAggregate(
      paymentData.id,
      paymentData.orderId,
      paymentData.amount,
      paymentData.currency,
      paymentData.status,
      paymentData.authorizationCode,
      paymentData.createdAt,
      paymentData.updatedAt
    );

    payment.cancel();
    await this.paymentRepository.save(payment.toDTO());

    const event: PaymentCancelledEvent = {
      eventId: uuidv4(),
      type: 'PaymentCancelled',
      occurredAt: new Date().toISOString(),
      aggregateId: paymentId,
      version: 2,
      correlationId,
      payload: {
        orderId: payment.orderId,
      },
    };

    await this.eventBus.publish(event);
  }

  private async simulatePaymentGateway(amount: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    if (Math.random() < 0.05) {
      throw new Error('Payment gateway error');
    }
  }
}