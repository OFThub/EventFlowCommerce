import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from '@aws-sdk/client-eventbridge';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { DomainEvent, EventBusAdapter, EventHandler, MessageHandler } from '../types';

export class EventBridgeAdapter implements EventBusAdapter {
  private eventBridgeClient: EventBridgeClient;
  private sqsClient: SQSClient;
  private eventBusName: string;
  private subscriptions: Map<string, EventHandler[]> = new Map();

  constructor(config: { region: string; eventBusName: string; endpoint?: string }) {
    const clientConfig: any = { region: config.region };
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
    }
    this.eventBridgeClient = new EventBridgeClient(clientConfig);
    this.sqsClient = new SQSClient(clientConfig);
    this.eventBusName = config.eventBusName;
  }

  async publish(event: DomainEvent): Promise<void> {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          Source: 'eventflow.commerce',
          DetailType: event.type,
          Detail: JSON.stringify(event),
          EventBusName: this.eventBusName,
        },
      ],
    };

    await this.eventBridgeClient.send(new PutEventsCommand(params));
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(handler);
  }

  async publishToQueue(queueName: string, message: any): Promise<void> {
    const queueUrl = `${process.env.SQS_ENDPOINT || 'http://localhost:4566'}/000000000000/${queueName}`;
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
  }

  async consumeFromQueue(queueName: string, handler: MessageHandler): Promise<void> {
    const queueUrl = `${process.env.SQS_ENDPOINT || 'http://localhost:4566'}/000000000000/${queueName}`;
    
    const poll = async () => {
      while (true) {
        try {
          const result = await this.sqsClient.send(
            new ReceiveMessageCommand({
              QueueUrl: queueUrl,
              MaxNumberOfMessages: 10,
              WaitTimeSeconds: 20,
            })
          );

          if (result.Messages && result.Messages.length > 0) {
            for (const message of result.Messages) {
              try {
                const body = JSON.parse(message.Body || '{}');
                await handler(body);
                
                await this.sqsClient.send(
                  new DeleteMessageCommand({
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle!,
                  })
                );
              } catch (error) {
                console.error('Error processing message:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error polling queue:', error);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    };

    poll();
  }
}