import { DomainEvent, EventBusAdapter, EventHandler, MessageHandler } from '../types';

export class LocalAdapter implements EventBusAdapter {
  private subscriptions: Map<string, EventHandler[]> = new Map();
  private queueHandlers: Map<string, MessageHandler[]> = new Map();
  private queues: Map<string, any[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.subscriptions.get(event.type) || [];
    for (const handler of handlers) {
      setImmediate(async () => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error handling event ${event.type}:`, error);
        }
      });
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(handler);
  }

  async publishToQueue(queueName: string, message: any): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    this.queues.get(queueName)!.push(message);
    
    setImmediate(() => this.processQueue(queueName));
  }

  async consumeFromQueue(queueName: string, handler: MessageHandler): Promise<void> {
    if (!this.queueHandlers.has(queueName)) {
      this.queueHandlers.set(queueName, []);
    }
    this.queueHandlers.get(queueName)!.push(handler);
  }

  private async processQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    const handlers = this.queueHandlers.get(queueName);
    
    if (!queue || !handlers || queue.length === 0 || handlers.length === 0) {
      return;
    }

    const message = queue.shift();
    if (message) {
      for (const handler of handlers) {
        try {
          await handler(message);
        } catch (error) {
          console.error(`Error processing queue message in ${queueName}:`, error);
        }
      }
    }
  }
}