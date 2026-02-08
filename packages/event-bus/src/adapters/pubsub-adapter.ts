import { PubSub, Topic, Subscription } from '@google-cloud/pubsub';
import { DomainEvent, EventBusAdapter, EventHandler, MessageHandler } from '../types';

export class PubSubAdapter implements EventBusAdapter {
  private pubsub: PubSub;
  private topicPrefix: string;
  private topics: Map<string, Topic> = new Map();

  constructor(config: { projectId: string; topicPrefix?: string }) {
    this.pubsub = new PubSub({ projectId: config.projectId });
    this.topicPrefix = config.topicPrefix || 'eventflow';
  }

  private async getOrCreateTopic(eventType: string): Promise<Topic> {
    if (this.topics.has(eventType)) {
      return this.topics.get(eventType)!;
    }

    const topicName = `${this.topicPrefix}-${eventType}`;
    const [topic] = await this.pubsub.topic(topicName).get({ autoCreate: true });
    this.topics.set(eventType, topic);
    return topic;
  }

  async publish(event: DomainEvent): Promise<void> {
    const topic = await this.getOrCreateTopic(event.type);
    const dataBuffer = Buffer.from(JSON.stringify(event));
    await topic.publishMessage({ data: dataBuffer });
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const topic = await this.getOrCreateTopic(eventType);
    const subscriptionName = `${this.topicPrefix}-${eventType}-sub-${Date.now()}`;
    
    const [subscription] = await topic.createSubscription(subscriptionName);
    
    subscription.on('message', async (message) => {
      try {
        const event: DomainEvent = JSON.parse(message.data.toString());
        await handler(event);
        message.ack();
      } catch (error) {
        console.error('Error handling message:', error);
        message.nack();
      }
    });

    subscription.on('error', (error) => {
      console.error('Subscription error:', error);
    });
  }

  async publishToQueue(queueName: string, message: any): Promise<void> {
    const topic = await this.getOrCreateTopic(queueName);
    const dataBuffer = Buffer.from(JSON.stringify(message));
    await topic.publishMessage({ data: dataBuffer });
  }

  async consumeFromQueue(queueName: string, handler: MessageHandler): Promise<void> {
    const topic = await this.getOrCreateTopic(queueName);
    const subscriptionName = `${queueName}-worker-${Date.now()}`;
    
    const [subscription] = await topic.createSubscription(subscriptionName);
    
    subscription.on('message', async (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        await handler(data);
        message.ack();
      } catch (error) {
        console.error('Error handling queue message:', error);
        message.nack();
      }
    });
  }
}