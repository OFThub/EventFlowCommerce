import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { SagaRepository } from '../infrastructure/saga-repository';
import { PlaceOrderSaga } from '../saga/place-order-saga';
import { createLogger } from '@eventflow/common';

const logger = createLogger('saga-coordinator');

export class SagaCoordinator {
  private saga: PlaceOrderSaga;

  constructor(
    private sagaRepository: SagaRepository,
    private eventBus: EventBus
  ) {
    this.saga = new PlaceOrderSaga(sagaRepository, eventBus);
  }

  async start(): Promise<void> {
    await this.eventBus.subscribe('OrderCreated', this.handleOrderCreated.bind(this));
    await this.eventBus.subscribe('InventoryReserved', this.handleInventoryReserved.bind(this));
    await this.eventBus.subscribe('PaymentAuthorized', this.handlePaymentAuthorized.bind(this));
    await this.eventBus.subscribe('ShipmentCreated', this.handleShipmentCreated.bind(this));
    await this.eventBus.subscribe('OrderCompleted', this.handleOrderCompleted.bind(this));
    await this.eventBus.subscribe('InventoryReservationFailed', this.handleFailure.bind(this));
    await this.eventBus.subscribe('PaymentFailed', this.handleFailure.bind(this));

    logger.info('Saga coordinator subscribed to events');
  }

  private async handleOrderCreated(event: DomainEvent): Promise<void> {
    await this.saga.handleOrderCreated(event);
  }

  private async handleInventoryReserved(event: DomainEvent): Promise<void> {
    await this.saga.handleInventoryReserved(event);
  }

  private async handlePaymentAuthorized(event: DomainEvent): Promise<void> {
    await this.saga.handlePaymentAuthorized(event);
  }

  private async handleShipmentCreated(event: DomainEvent): Promise<void> {
    await this.saga.handleShipmentCreated(event);
  }

  private async handleOrderCompleted(event: DomainEvent): Promise<void> {
    await this.saga.handleOrderCompleted(event);
  }

  private async handleFailure(event: DomainEvent): Promise<void> {
    await this.saga.handleFailure(event);
  }
}