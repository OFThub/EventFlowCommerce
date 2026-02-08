import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { signJWT, JWTPayload } from '@eventflow/common';
import { UserAggregate } from '../domain/user';
import { UserRepository } from '../infrastructure/user-repository';
import { EventBus } from '@eventflow/event-bus';
import { UserCreatedEvent, UserAuthenticatedEvent } from '../domain/events';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {}

  async register(email: string, password: string, correlationId: string): Promise<{ userId: string; token: string }> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const user = UserAggregate.create(userId, email, passwordHash);

    await this.userRepository.save(user.toDTO());

    const event: UserCreatedEvent = {
      eventId: uuidv4(),
      type: 'UserCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: userId,
      version: 1,
      correlationId,
      payload: {
        email: user.email,
        roles: user.roles,
      },
    };

    await this.eventBus.publish(event);

    const token = signJWT({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    return { userId, token };
  }

  async login(email: string, password: string, correlationId: string): Promise<{ userId: string; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const event: UserAuthenticatedEvent = {
      eventId: uuidv4(),
      type: 'UserAuthenticated',
      occurredAt: new Date().toISOString(),
      aggregateId: user.id,
      version: 1,
      correlationId,
      payload: {
        email: user.email,
      },
    };

    await this.eventBus.publish(event);

    const token = signJWT({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    return { userId: user.id, token };
  }
}