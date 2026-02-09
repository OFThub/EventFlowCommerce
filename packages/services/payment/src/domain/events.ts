export interface PaymentAuthorizedEvent {
  eventId: string;
  type: 'PaymentAuthorized';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    amount: number;
    authorizationCode: string;
  };
}

export interface PaymentCapturedEvent {
  eventId: string;
  type: 'PaymentCaptured';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
  };
}

export interface PaymentCancelledEvent {
  eventId: string;
  type: 'PaymentCancelled';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
  };
}

export interface PaymentFailedEvent {
  eventId: string;
  type: 'PaymentFailed';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    orderId: string;
    reason: string;
  };
}