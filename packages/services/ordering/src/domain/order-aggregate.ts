import { v4 as uuidv4 } from 'uuid';
import { OrderItem, Address, OrderStatus } from './value-objects';
import { OrderEvent, OrderCreatedEvent, OrderConfirmedEvent, OrderCompletedEvent, OrderCancelledEvent } from './events';

export class OrderAggregate {
  private events: OrderEvent[] = [];
  
  public id: string;
  public customerId: string;
  public items: OrderItem[];
  public shippingAddress: Address;
  public totalAmount: number;
  public status: OrderStatus;
  public version: number;
  public paymentId?: string;
  public inventoryReservationId?: string;
  public shipmentId?: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(id: string) {
    this.id = id;
    this.customerId = '';
    this.items = [];
    this.shippingAddress = { street: '', city: '', state: '', zip: '' };
    this.totalAmount = 0;
    this.status = OrderStatus.PENDING;
    this.version = 0;
    this.createdAt = '';
    this.updatedAt = '';
  }

  static create(
    id: string,
    customerId: string,
    items: OrderItem[],
    shippingAddress: Address,
    correlationId: string
  ): OrderAggregate {
    const order = new OrderAggregate(id);
    
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const event: OrderCreatedEvent = {
      eventId: uuidv4(),
      type: 'OrderCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: id,
      version: 1,
      correlationId,
      payload: {
        customerId,
        items,
        shippingAddress,
        totalAmount,
      },
    };

    order.applyEvent(event);
    return order;
  }

  confirm(paymentId: string, inventoryReservationId: string, correlationId: string): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Can only confirm pending orders');
    }

    const event: OrderConfirmedEvent = {
      eventId: uuidv4(),
      type: 'OrderConfirmed',
      occurredAt: new Date().toISOString(),
      aggregateId: this.id,
      version: this.version + 1,
      correlationId,
      payload: {
        paymentId,
        inventoryReservationId,
      },
    };

    this.applyEvent(event);
  }

  complete(shipmentId: string, correlationId: string): void {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error('Can only complete confirmed orders');
    }

    const event: OrderCompletedEvent = {
      eventId: uuidv4(),
      type: 'OrderCompleted',
      occurredAt: new Date().toISOString(),
      aggregateId: this.id,
      version: this.version + 1,
      correlationId,
      payload: {
        shipmentId,
      },
    };

    this.applyEvent(event);
  }

  cancel(reason: string, correlationId: string): void {
    if (this.status === OrderStatus.COMPLETED) {
      throw new Error('Cannot cancel completed orders');
    }
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error('Order already cancelled');
    }

    const event: OrderCancelledEvent = {
      eventId: uuidv4(),
      type: 'OrderCancelled',
      occurredAt: new Date().toISOString(),
      aggregateId: this.id,
      version: this.version + 1,
      correlationId,
      payload: {
        reason,
      },
    };

    this.applyEvent(event);
  }

  private applyEvent(event: OrderEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        this.customerId = event.payload.customerId;
        this.items = event.payload.items;
        this.shippingAddress = event.payload.shippingAddress;
        this.totalAmount = event.payload.totalAmount;
        this.status = OrderStatus.PENDING;
        this.createdAt = event.occurredAt;
        this.updatedAt = event.occurredAt;
        break;
      case 'OrderConfirmed':
        this.status = OrderStatus.CONFIRMED;
        this.paymentId = event.payload.paymentId;
        this.inventoryReservationId = event.payload.inventoryReservationId;
        this.updatedAt = event.occurredAt;
        break;
      case 'OrderCompleted':
        this.status = OrderStatus.COMPLETED;
        this.shipmentId = event.payload.shipmentId;
        this.updatedAt = event.occurredAt;
        break;
      case 'OrderCancelled':
        this.status = OrderStatus.CANCELLED;
        this.updatedAt = event.occurredAt;
        break;
    }
    
    this.version = event.version;
    this.events.push(event);
  }

  getUncommittedEvents(): OrderEvent[] {
    return this.events;
  }

  markEventsAsCommitted(): void {
    this.events = [];
  }

  static fromEvents(id: string, events: OrderEvent[]): OrderAggregate {
    const order = new OrderAggregate(id);
    events.forEach((event) => order.applyEvent(event));
    return order;
  }
}