"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payment_1 = require("../src/domain/payment");
var uuid_1 = require("uuid");
describe('PaymentAggregate', function () {
    it('should create a payment', function () {
        var paymentId = (0, uuid_1.v4)();
        var orderId = (0, uuid_1.v4)();
        var payment = payment_1.PaymentAggregate.create(paymentId, orderId, 100);
        expect(payment.id).toBe(paymentId);
        expect(payment.orderId).toBe(orderId);
        expect(payment.amount).toBe(100);
        expect(payment.status).toBe(payment_1.PaymentStatus.PENDING);
    });
    it('should authorize a payment', function () {
        var payment = payment_1.PaymentAggregate.create((0, uuid_1.v4)(), (0, uuid_1.v4)(), 100);
        payment.authorize();
        expect(payment.status).toBe(payment_1.PaymentStatus.AUTHORIZED);
        expect(payment.authorizationCode).toBeDefined();
    });
    it('should cancel a payment', function () {
        var payment = payment_1.PaymentAggregate.create((0, uuid_1.v4)(), (0, uuid_1.v4)(), 100);
        payment.cancel();
        expect(payment.status).toBe(payment_1.PaymentStatus.CANCELLED);
    });
});
