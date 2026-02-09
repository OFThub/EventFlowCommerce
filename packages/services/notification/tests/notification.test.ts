import { NotificationService } from '../src/application/notification-service';
import { EventBus } from '@eventflow/event-bus';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@eventflow/event-bus');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    eventBus = new EventBus({ adapter: 'local' }) as jest.Mocked<EventBus>;
    notificationService = new NotificationService(eventBus);
  });

  it('should send order confirmation', async () => {
    eventBus.publish.mockResolvedValue();

    await notificationService.sendOrderConfirmation('order-1', 'customer@example.com', uuidv4());

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NotificationSent',
        payload: expect.objectContaining({
          subject: 'Order Confirmation',
        }),
      })
    );
  });
});