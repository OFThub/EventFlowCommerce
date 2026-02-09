import { ShippingAddress } from './shipment';

export interface ShipmentCreatedEvent {
  eventId: string;
  type: 'ShipmentCreated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
  };
}

export interface ShipmentCancelledEvent {
  eventId: string;
  type: 'ShipmentCancelled';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
  };
}