export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  authorizationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export class PaymentAggregate {
  constructor(
    public readonly id: string,
    public orderId: string,
    public amount: number,
    public currency: string,
    public status: PaymentStatus,
    public authorizationCode: string | undefined,
    public createdAt: string,
    public updatedAt: string
  ) {}

  static create(id: string, orderId: string, amount: number, currency: string = 'USD'): PaymentAggregate {
    const now = new Date().toISOString();
    return new PaymentAggregate(id, orderId, amount, currency, PaymentStatus.PENDING, undefined, now, now);
  }

  authorize(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Can only authorize pending payments');
    }
    this.status = PaymentStatus.AUTHORIZED;
    this.authorizationCode = `AUTH-${Date.now()}`;
    this.updatedAt = new Date().toISOString();
  }

  capture(): void {
    if (this.status !== PaymentStatus.AUTHORIZED) {
      throw new Error('Can only capture authorized payments');
    }
    this.status = PaymentStatus.CAPTURED;
    this.updatedAt = new Date().toISOString();
  }

  cancel(): void {
    if (this.status === PaymentStatus.CAPTURED) {
      throw new Error('Cannot cancel captured payments');
    }
    this.status = PaymentStatus.CANCELLED;
    this.updatedAt = new Date().toISOString();
  }

  fail(): void {
    this.status = PaymentStatus.FAILED;
    this.updatedAt = new Date().toISOString();
  }

  toDTO(): Payment {
    return {
      id: this.id,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      authorizationCode: this.authorizationCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}