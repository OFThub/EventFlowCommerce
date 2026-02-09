import { OrderCommandHandler } from '../src/application/order-command-handler';
import { EventStore } from '../src/infrastructure/event-store';
import { EventBus } from '@eventflow/event-bus';
import { v4 as uuidv4 } from 'uuid';

describe('Ordering Integration', () => {
  let commandHandler: OrderCommandHandler;
  let eventStore: EventStore;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus({ adapter: 'local' });
    eventStore = new EventStore();
    commandHandler = new OrderCommandHandler(eventStore, eventBus);
  });

  it('should create and retrieve an order', async () => {
    const correlationId = uuidv4();
    const customerId = uuidv4();
    const items = [{ productId: 'prod-1', quantity: 2, price: 50 }];
    const address = { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' };

    const orderId = await commandHandler.createOrder(customerId, items, address, correlationId);

    expect(orderId).toBeDefined();

    const events = await eventStore.getEvents(orderId);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('OrderCreated');
  }, 10000);
});