import { EventBus } from '../src/event-bus';
import { DomainEvent } from '../src/types';
import { v4 as uuidv4 } from 'uuid';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus({ adapter: 'local' });
  });

  it('should publish and receive events', async () => {
    const receivedEvents: DomainEvent[] = [];
    
    await eventBus.subscribe('TestEvent', async (event) => {
      receivedEvents.push(event);
    });

    const event: DomainEvent = {
      eventId: uuidv4(),
      type: 'TestEvent',
      occurredAt: new Date().toISOString(),
      aggregateId: 'test-1',
      version: 1,
      correlationId: uuidv4(),
      payload: { data: 'test' },
    };

    await eventBus.publish(event);
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0].type).toBe('TestEvent');
    expect(receivedEvents[0].payload.data).toBe('test');
  });

  it('should handle queue messages', async () => {
    const receivedMessages: any[] = [];
    
    await eventBus.consumeFromQueue('test-queue', async (message) => {
      receivedMessages.push(message);
    });

    await eventBus.publishToQueue('test-queue', { data: 'queue-message' });
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(receivedMessages).toHaveLength(1);
    expect(receivedMessages[0].data).toBe('queue-message');
  });
});