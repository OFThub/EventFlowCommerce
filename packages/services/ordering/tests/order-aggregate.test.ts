import { OrderAggregate } from '../src/domain/order-aggregate';
import { OrderStatus } from '../src/domain/value-objects';
import { v4 as uuidv4 } from 'uuid';

describe('OrderAggregate', () => {
  it('should create a new order', () => {
    const orderId = uuidv4();
    const customerId = uuidv4();
    const items = [{ productId: 'prod-1', quantity: 2, price: 50 }];
    const address = { street: '123 Main St', city: 'Seattle', state: 'WA', zip: '98101' };
    const correlationId = uuidv4();

    const order = OrderAggregate.create(orderId, customerId, items, address, correlationId);

    expect(order.id).toBe(orderId);
    expect(order.customerId).toBe(customerId);
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.totalAmount).toBe(100);
    expect(order.version).toBe(1);
    expect(order.getUncommittedEvents()).toHaveLength(1);
    expect(order.getUncommittedEvents()[0].type).toBe('OrderCreated');
  });

  it('should confirm an order', () => {
    const orderId = uuidv4();
    const order = OrderAggregate.create(
      orderId,
      'customer-1',
      [{ productId: 'prod-1', quantity: 1, price: 100 }],
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      uuidv4()
    );

    order.markEventsAsCommitted();
    order.confirm('payment-1', 'reservation-1', uuidv4());

    expect(order.status).toBe(OrderStatus.CONFIRMED);
    expect(order.paymentId).toBe('payment-1');
    expect(order.inventoryReservationId).toBe('reservation-1');
    expect(order.version).toBe(2);
  });

  it('should complete an order', () => {
    const orderId = uuidv4();
    const order = OrderAggregate.create(
      orderId,
      'customer-1',
      [{ productId: 'prod-1', quantity: 1, price: 100 }],
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      uuidv4()
    );

    order.markEventsAsCommitted();
    order.confirm('payment-1', 'reservation-1', uuidv4());
    order.markEventsAsCommitted();
    order.complete('shipment-1', uuidv4());

    expect(order.status).toBe(OrderStatus.COMPLETED);
    expect(order.shipmentId).toBe('shipment-1');
    expect(order.version).toBe(3);
  });

  it('should cancel an order', () => {
    const orderId = uuidv4();
    const order = OrderAggregate.create(
      orderId,
      'customer-1',
      [{ productId: 'prod-1', quantity: 1, price: 100 }],
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      uuidv4()
    );

    order.markEventsAsCommitted();
    order.cancel('Payment failed', uuidv4());

    expect(order.status).toBe(OrderStatus.CANCELLED);
    expect(order.version).toBe(2);
  });

  it('should throw error when confirming non-pending order', () => {
    const order = OrderAggregate.create(
      uuidv4(),
      'customer-1',
      [{ productId: 'prod-1', quantity: 1, price: 100 }],
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      uuidv4()
    );

    order.markEventsAsCommitted();
    order.confirm('payment-1', 'reservation-1', uuidv4());

    expect(() => {
      order.confirm('payment-2', 'reservation-2', uuidv4());
    }).toThrow('Can only confirm pending orders');
  });

  it('should rebuild from events', () => {
    const orderId = uuidv4();
    const order = OrderAggregate.create(
      orderId,
      'customer-1',
      [{ productId: 'prod-1', quantity: 2, price: 50 }],
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
      uuidv4()
    );

    const events = order.getUncommittedEvents();
    const rebuilt = OrderAggregate.fromEvents(orderId, events);

    expect(rebuilt.id).toBe(order.id);
    expect(rebuilt.status).toBe(order.status);
    expect(rebuilt.totalAmount).toBe(order.totalAmount);
    expect(rebuilt.version).toBe(order.version);
  });
});