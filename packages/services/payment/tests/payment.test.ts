import { PaymentAggregate, PaymentStatus } from '../src/domain/payment';
import { v4 as uuidv4 } from 'uuid';

describe('PaymentAggregate', () => {
  it('should create a payment', () => {
    const paymentId = uuidv4();
    const orderId = uuidv4();
    const payment = PaymentAggregate.create(paymentId, orderId, 100);

    expect(payment.id).toBe(paymentId);
    expect(payment.orderId).toBe(orderId);
    expect(payment.amount).toBe(100);
    expect(payment.status).toBe(PaymentStatus.PENDING);
  });

  it('should authorize a payment', () => {
    const payment = PaymentAggregate.create(uuidv4(), uuidv4(), 100);
    payment.authorize();

    expect(payment.status).toBe(PaymentStatus.AUTHORIZED);
    expect(payment.authorizationCode).toBeDefined();
  });

  it('should cancel a payment', () => {
    const payment = PaymentAggregate.create(uuidv4(), uuidv4(), 100);
    payment.cancel();

    expect(payment.status).toBe(PaymentStatus.CANCELLED);
  });
});