export interface InventoryReservedEvent {
  eventId: string;
  type: 'InventoryReserved';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    reservationId: string;
    items: Array<{ productId: string; quantity: number }>;
  };
}

export interface InventoryReleasedEvent {
  eventId: string;
  type: 'InventoryReleased';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    reservationId: string;
  };
}

export interface InventoryReservationFailedEvent {
  eventId: string;
  type: 'InventoryReservationFailed';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    reason: string;
  };
}