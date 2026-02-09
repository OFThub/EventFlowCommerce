export enum SagaStatus {
  STARTED = 'STARTED',
  INVENTORY_RESERVED = 'INVENTORY_RESERVED',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

export interface SagaState {
  sagaId: string;
  orderId: string;
  status: SagaStatus;
  inventoryReservationId?: string;
  paymentId?: string;
  shipmentId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  correlationId: string;
}