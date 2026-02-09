export enum ShipmentStatus {
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  address: ShippingAddress;
  status: ShipmentStatus;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export class ShipmentAggregate {
  constructor(
    public readonly id: string,
    public orderId: string,
    public address: ShippingAddress,
    public status: ShipmentStatus,
    public trackingNumber: string | undefined,
    public carrier: string | undefined,
    public createdAt: string,
    public updatedAt: string
  ) {}

  static create(id: string, orderId: string, address: ShippingAddress): ShipmentAggregate {
    const now = new Date().toISOString();
    return new ShipmentAggregate(id, orderId, address, ShipmentStatus.PENDING, undefined, undefined, now, now);
  }

  createShipment(carrier: string = 'FEDEX'): void {
    if (this.status !== ShipmentStatus.PENDING) {
      throw new Error('Can only create pending shipments');
    }
    this.status = ShipmentStatus.CREATED;
    this.trackingNumber = `TRK-${Date.now()}`;
    this.carrier = carrier;
    this.updatedAt = new Date().toISOString();
  }

  cancel(): void {
    if (this.status === ShipmentStatus.DELIVERED) {
      throw new Error('Cannot cancel delivered shipments');
    }
    this.status = ShipmentStatus.CANCELLED;
    this.updatedAt = new Date().toISOString();
  }

  toDTO(): Shipment {
    return {
      id: this.id,
      orderId: this.orderId,
      address: this.address,
      status: this.status,
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}