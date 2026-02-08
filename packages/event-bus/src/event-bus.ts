import { DomainEvent, EventBusAdapter, EventBusConfig, EventHandler, MessageHandler } from './types';
import { EventBridgeAdapter } from './adapters/eventbridge-adapter';
import { PubSubAdapter } from './adapters/pubsub-adapter';
import { LocalAdapter } from './adapters/local-adapter';

export class EventBus {
  private adapter: EventBusAdapter;

  constructor(config: EventBusConfig) {
    switch (config.adapter) {
      case 'eventbridge':
        this.adapter = new EventBridgeAdapter(config.aws!);
        break;
      case 'pubsub':
        this.adapter = new PubSubAdapter(config.gcp!);
        break;
      case 'local':
        this.adapter = new LocalAdapter();
        break;
      default:
        throw new Error(`Unknown adapter: ${config.adapter}`);
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    return this.adapter.publish(event);
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    return this.adapter.subscribe(eventType, handler);
  }

  async publishToQueue(queueName: string, message: any): Promise<void> {
    return this.adapter.publishToQueue(queueName, message);
  }

  async consumeFromQueue(queueName: string, handler: MessageHandler): Promise<void> {
    return this.adapter.consumeFromQueue(queueName, handler);
  }
}