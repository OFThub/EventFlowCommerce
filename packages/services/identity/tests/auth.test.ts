import { AuthService } from '../src/application/auth-service';
import { UserRepository } from '../src/infrastructure/user-repository';
import { EventBus } from '@eventflow/event-bus';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../src/infrastructure/user-repository');
jest.mock('@eventflow/event-bus');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    eventBus = new EventBus({ adapter: 'local' }) as jest.Mocked<EventBus>;
    authService = new AuthService(userRepository, eventBus);
  });

  it('should register a new user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue();
    eventBus.publish.mockResolvedValue();

    const result = await authService.register('test@example.com', 'password', uuidv4());

    expect(result.userId).toBeDefined();
    expect(result.token).toBeDefined();
    expect(userRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UserCreated',
      })
    );
  });

  it('should throw error if user already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      passwordHash: 'hash',
      roles: ['customer'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await expect(
      authService.register('test@example.com', 'password', uuidv4())
    ).rejects.toThrow('User already exists');
  });
});