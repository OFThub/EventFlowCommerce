import { OrderItem, Address, OrderStatus } from './value-objects';

export interface OrderCreatedEvent {
  eventId: string;
  type: 'OrderCreated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    customerId: string;
    items: OrderItem[];
    shippingAddress: Address;
    totalAmount: number;
  };
}

export interface OrderConfirmedEvent {
  eventId: string;
  type: 'OrderConfirmed';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    paymentId: string;
    inventoryReservationId: string;
  };
}

export interface OrderCompletedEvent {
  eventId: string;
  type: 'OrderCompleted';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    shipmentId: string;
  };
}

export interface OrderCancelledEvent {
  eventId: string;
  type: 'OrderCancelled';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    reason: string;
  };
}

export type OrderEvent = OrderCreatedEvent | OrderConfirmedEvent | OrderCompletedEvent | OrderCancelledEvent;