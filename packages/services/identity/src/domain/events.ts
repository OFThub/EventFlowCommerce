export interface UserCreatedEvent {
  eventId: string;
  type: 'UserCreated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    email: string;
    roles: string[];
  };
}

export interface UserAuthenticatedEvent {
  eventId: string;
  type: 'UserAuthenticated';
  occurredAt: string;
  aggregateId: string;
  version: number;
  correlationId: string;
  payload: {
    email: string;
  };
}