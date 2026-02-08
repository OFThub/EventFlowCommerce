export interface DomainEvent {
  eventId: string;
  type: string;
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: Record<string, any>;
}

export interface EventBusAdapter {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Promise<void>;
  publishToQueue(queueName: string, message: any): Promise<void>;
  consumeFromQueue(queueName: string, handler: MessageHandler): Promise<void>;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;
export type MessageHandler = (message: any) => Promise<void>;

export interface EventBusConfig {
  adapter: 'eventbridge' | 'pubsub' | 'local';
  aws?: {
    region: string;
    eventBusName: string;
    endpoint?: string;
  };
  gcp?: {
    projectId: string;
    topicPrefix?: string;
  };
}