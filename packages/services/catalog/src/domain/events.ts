export interface ProductCreatedEvent {
  eventId: string;
  type: 'ProductCreated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    name: string;
    price: number;
    category: string;
  };
}

export interface ProductPriceUpdatedEvent {
  eventId: string;
  type: 'ProductPriceUpdated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    oldPrice: number;
    newPrice: number;
  };
}