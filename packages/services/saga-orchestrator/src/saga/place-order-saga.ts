import { v4 as uuidv4 } from 'uuid';
import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { SagaState, SagaStatus } from './saga-state';
import { SagaRepository } from '../infrastructure/saga-repository';
import { compensatePayment, compensateInventory, compensateShipment, compensateOrder } from './compensation';
import { createLogger } from '@eventflow/common';

const logger = createLogger('place-order-saga');

export class PlaceOrderSaga {
  constructor(
    private sagaRepository: SagaRepository,
    private eventBus: EventBus
  ) {}

  async handleOrderCreated(event: DomainEvent): Promise<void> {
    const { customerId, items, shippingAddress, totalAmount } = event.payload;
    const orderId = event.aggregateId;

    const sagaState: SagaState = {
      sagaId: uuidv4(),
      orderId,
      status: SagaStatus.STARTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      correlationId: event.correlationId,
    };

    await this.sagaRepository.save(sagaState);
    logger.info({ sagaId: sagaState.sagaId, orderId }, 'Saga started');

    const reserveInventoryCommand: DomainEvent = {
      eventId: uuidv4(),
      type: 'ReserveInventory',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId: event.correlationId,
      payload: {
        orderId,
        items,
      },
    };

    await this.eventBus.publish(reserveInventoryCommand);
  }

  async handleInventoryReserved(event: DomainEvent): Promise<void> {
    const { orderId, reservationId } = event.payload;
    const sagaState = await this.sagaRepository.findByOrderId(orderId);

    if (!sagaState) {
      logger.error({ orderId }, 'Saga state not found');
      return;
    }

    sagaState.status = SagaStatus.INVENTORY_RESERVED;
    sagaState.inventoryReservationId = reservationId;
    sagaState.updatedAt = new Date().toISOString();
    await this.sagaRepository.save(sagaState);

    logger.info({ sagaId: sagaState.sagaId, reservationId }, 'Inventory reserved');

    const orderEvents = await this.getOrderDetails(orderId);
    const totalAmount = orderEvents.payload.totalAmount;

    const authorizePaymentCommand: DomainEvent = {
      eventId: uuidv4(),
      type: 'AuthorizePayment',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId: event.correlationId,
      payload: {
        orderId,
        amount: totalAmount,
      },
    };

    await this.eventBus.publish(authorizePaymentCommand);
  }

  async handlePaymentAuthorized(event: DomainEvent): Promise<void> {
    const { orderId, authorizationCode } = event.payload;
    const paymentId = event.aggregateId;
    const sagaState = await this.sagaRepository.findByOrderId(orderId);

    if (!sagaState) {
      logger.error({ orderId }, 'Saga state not found');
      return;
    }

    sagaState.status = SagaStatus.PAYMENT_AUTHORIZED;
    sagaState.paymentId = paymentId;
    sagaState.updatedAt = new Date().toISOString();
    await this.sagaRepository.save(sagaState);

    logger.info({ sagaId: sagaState.sagaId, paymentId }, 'Payment authorized');

    const orderEvents = await this.getOrderDetails(orderId);
    const shippingAddress = orderEvents.payload.shippingAddress;

    const createShipmentCommand: DomainEvent = {
      eventId: uuidv4(),
      type: 'CreateShipment',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId: event.correlationId,
      payload: {
        orderId,
        address: shippingAddress,
      },
    };

    await this.eventBus.publish(createShipmentCommand);
  }

  async handleShipmentCreated(event: DomainEvent): Promise<void> {
    const { orderId, trackingNumber } = event.payload;
    const shipmentId = event.aggregateId;
    const sagaState = await this.sagaRepository.findByOrderId(orderId);

    if (!sagaState) {
      logger.error({ orderId }, 'Saga state not found');
      return;
    }

    sagaState.status = SagaStatus.SHIPMENT_CREATED;
    sagaState.shipmentId = shipmentId;
    sagaState.updatedAt = new Date().toISOString();
    await this.sagaRepository.save(sagaState);

    logger.info({ sagaId: sagaState.sagaId, shipmentId }, 'Shipment created');

    const completeOrderCommand: DomainEvent = {
      eventId: uuidv4(),
      type: 'CompleteOrder',
      occurredAt: new Date().toISOString(),
      aggregateId: orderId,
      version: 1,
      correlationId: event.correlationId,
      payload: {
        orderId,
        shipmentId,
      },
    };

    await this.eventBus.publish(completeOrderCommand);
  }

  async handleOrderCompleted(event: DomainEvent): Promise<void> {
    const orderId = event.aggregateId;
    const sagaState = await this.sagaRepository.findByOrderId(orderId);

    if (!sagaState) {
      logger.error({ orderId }, 'Saga state not found');
      return;
    }

    sagaState.status = SagaStatus.COMPLETED;
    sagaState.updatedAt = new Date().toISOString();
    await this.sagaRepository.save(sagaState);

    logger.info({ sagaId: sagaState.sagaId, orderId }, 'Saga completed successfully');

    await this.eventBus.publishToQueue('notification-queue', {
      type: 'OrderConfirmed',
      orderId,
      customerEmail: 'customer@example.com',
      correlationId: event.correlationId,
    });
  }

  async handleFailure(event: DomainEvent): Promise<void> {
    const orderId = event.payload.orderId;
    const sagaState = await this.sagaRepository.findByOrderId(orderId);

    if (!sagaState) {
      logger.error({ orderId }, 'Saga state not found');
      return;
    }

    sagaState.status = SagaStatus.COMPENSATING;
    sagaState.failureReason = event.payload.reason;
    sagaState.updatedAt = new Date().toISOString();
    await this.sagaRepository.save(sagaState);

    logger.warn({ sagaId: sagaState.sagaId, reason: event.payload.reason }, 'Starting compensation');

    await this.compensate(sagaState);
  }

  private async compensate(sagaState: SagaState): Promise<void> {
    try {
      if (sagaState.shipmentId) {
        await compensateShipment(sagaState.shipmentId, this.eventBus, sagaState.correlationId);
      }

      if (sagaState.paymentId) {
        await compensatePayment(sagaState.paymentId, this.eventBus, sagaState.correlationId);
      }

      if (sagaState.inventoryReservationId) {
        await compensateInventory(sagaState.inventoryReservationId, this.eventBus, sagaState.correlationId);
      }

      await compensateOrder(sagaState.orderId, sagaState.failureReason || 'Saga failed', this.eventBus, sagaState.correlationId);

      sagaState.status = SagaStatus.FAILED;
      sagaState.updatedAt = new Date().toISOString();
      await this.sagaRepository.save(sagaState);

      logger.info({ sagaId: sagaState.sagaId }, 'Compensation completed');

      await this.eventBus.publishToQueue('notification-queue', {
        type: 'OrderCancelled',
        orderId: sagaState.orderId,
        customerEmail: 'customer@example.com',
        correlationId: sagaState.correlationId,
      });
    } catch (error) {
      logger.error({ error, sagaId: sagaState.sagaId }, 'Compensation failed');
    }
  }

  private async getOrderDetails(orderId: string): Promise<any> {
    return {
      payload: {
        totalAmount: 100,
        shippingAddress: { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      },
    };
  }
}