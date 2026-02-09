export interface NotificationSentEvent {
  eventId: string;
  type: 'NotificationSent';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    recipient: string;
    subject: string;
    channel: string;
  };
}