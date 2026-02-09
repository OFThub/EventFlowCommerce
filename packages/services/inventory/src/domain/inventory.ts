export interface InventoryItem {
  productId: string;
  availableStock: number;
  reservedStock: number;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  orderId: string;
  status: 'ACTIVE' | 'RELEASED' | 'COMMITTED';
  createdAt: string;
  updatedAt: string;
}

export class InventoryAggregate {
  constructor(
    public readonly productId: string,
    public availableStock: number,
    public reservedStock: number,
    public updatedAt: string
  ) {}

  static create(productId: string, initialStock: number): InventoryAggregate {
    return new InventoryAggregate(productId, initialStock, 0, new Date().toISOString());
  }

  reserve(quantity: number): void {
    if (this.availableStock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.availableStock -= quantity;
    this.reservedStock += quantity;
    this.updatedAt = new Date().toISOString();
  }

  release(quantity: number): void {
    this.reservedStock -= quantity;
    this.availableStock += quantity;
    this.updatedAt = new Date().toISOString();
  }

  commit(quantity: number): void {
    this.reservedStock -= quantity;
    this.updatedAt = new Date().toISOString();
  }

  toDTO(): InventoryItem {
    return {
      productId: this.productId,
      availableStock: this.availableStock,
      reservedStock: this.reservedStock,
      updatedAt: this.updatedAt,
    };
  }
}