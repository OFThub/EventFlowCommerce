import { v4 as uuidv4 } from 'uuid';
import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { createLogger } from '@eventflow/common';

const logger = createLogger('saga-compensation');

export async function compensatePayment(
  paymentId: string,
  eventBus: EventBus,
  correlationId: string
): Promise<void> {
  logger.info({ paymentId }, 'Compensating payment');

  const cancelPaymentCommand: DomainEvent = {
    eventId: uuidv4(),
    type: 'CancelPayment',
    occurredAt: new Date().toISOString(),
    aggregateId: paymentId,
    version: 1,
    correlationId,
    payload: {
      paymentId,
    },
  };

  await eventBus.publish(cancelPaymentCommand);
}

export async function compensateInventory(
  reservationId: string,
  eventBus: EventBus,
  correlationId: string
): Promise<void> {
  logger.info({ reservationId }, 'Compensating inventory');

  const releaseInventoryCommand: DomainEvent = {
    eventId: uuidv4(),
    type: 'ReleaseInventory',
    occurredAt: new Date().toISOString(),
    aggregateId: reservationId,
    version: 1,
    correlationId,
    payload: {
      reservationId,
    },
  };

  await eventBus.publish(releaseInventoryCommand);
}

export async function compensateShipment(
  shipmentId: string,
  eventBus: EventBus,
  correlationId: string
): Promise<void> {
  logger.info({ shipmentId }, 'Compensating shipment');

  const cancelShipmentCommand: DomainEvent = {
    eventId: uuidv4(),
    type: 'CancelShipment',
    occurredAt: new Date().toISOString(),
    aggregateId: shipmentId,
    version: 1,
    correlationId,
    payload: {
      shipmentId,
    },
  };

  await eventBus.publish(cancelShipmentCommand);
}

export async function compensateOrder(
  orderId: string,
  reason: string,
  eventBus: EventBus,
  correlationId: string
): Promise<void> {
  logger.info({ orderId, reason }, 'Compensating order');

  const cancelOrderCommand: DomainEvent = {
    eventId: uuidv4(),
    type: 'CancelOrder',
    occurredAt: new Date().toISOString(),
    aggregateId: orderId,
    version: 1,
    correlationId,
    payload: {
      orderId,
      reason,
    },
  };

  await eventBus.publish(cancelOrderCommand);
}