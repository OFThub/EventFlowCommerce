import { PlaceOrderSaga } from '../src/saga/place-order-saga';
import { SagaRepository } from '../src/infrastructure/saga-repository';
import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../src/infrastructure/saga-repository');
jest.mock('@eventflow/event-bus');

describe('PlaceOrderSaga', () => {
  let saga: PlaceOrderSaga;
  let sagaRepository: jest.Mocked<SagaRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    sagaRepository = new SagaRepository() as jest.Mocked<SagaRepository>;
    eventBus = new EventBus({ adapter: 'local' }) as jest.Mocked<EventBus>;
    saga = new PlaceOrderSaga(sagaRepository, eventBus);
  });

  it('should start saga on OrderCreated', async () => {
    sagaRepository.save.mockResolvedValue();
    eventBus.publish.mockResolvedValue();

    const event: DomainEvent = {
      eventId: uuidv4(),
      type: 'OrderCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: 'order-1',
      version: 1,
      correlationId: uuidv4(),
      payload: {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 2 }],
        shippingAddress: { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
        totalAmount: 100,
      },
    };

    await saga.handleOrderCreated(event);

    expect(sagaRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ReserveInventory',
      })
    );
  });
});