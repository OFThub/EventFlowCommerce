import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { PaymentRepository } from '../infrastructure/payment-repository';
import { PaymentService } from './payment-service';

export class PaymentEventHandler {
  private paymentService: PaymentService;

  constructor(
    private paymentRepository: PaymentRepository,
    private eventBus: EventBus
  ) {
    this.paymentService = new PaymentService(paymentRepository, eventBus);
  }

  async start(): Promise<void> {
    await this.eventBus.subscribe('AuthorizePayment', this.handleAuthorizePayment.bind(this));
    await this.eventBus.subscribe('CancelPayment', this.handleCancelPayment.bind(this));
  }

  private async handleAuthorizePayment(event: DomainEvent): Promise<void> {
    const { orderId, amount } = event.payload;
    try {
      await this.paymentService.authorizePayment(orderId, amount, event.correlationId);
    } catch (error) {
      console.error('Error authorizing payment:', error);
    }
  }

  private async handleCancelPayment(event: DomainEvent): Promise<void> {
    const { paymentId } = event.payload;
    try {
      await this.paymentService.cancelPayment(paymentId, event.correlationId);
    } catch (error) {
      console.error('Error cancelling payment:', error);
    }
  }
}