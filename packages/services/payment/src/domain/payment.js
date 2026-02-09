"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAggregate = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentAggregate = /** @class */ (function () {
    function PaymentAggregate(id, orderId, amount, currency, status, authorizationCode, createdAt, updatedAt) {
        this.id = id;
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.authorizationCode = authorizationCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    PaymentAggregate.create = function (id, orderId, amount, currency) {
        if (currency === void 0) { currency = 'USD'; }
        var now = new Date().toISOString();
        return new PaymentAggregate(id, orderId, amount, currency, PaymentStatus.PENDING, undefined, now, now);
    };
    PaymentAggregate.prototype.authorize = function () {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Can only authorize pending payments');
        }
        this.status = PaymentStatus.AUTHORIZED;
        this.authorizationCode = "AUTH-".concat(Date.now());
        this.updatedAt = new Date().toISOString();
    };
    PaymentAggregate.prototype.capture = function () {
        if (this.status !== PaymentStatus.AUTHORIZED) {
            throw new Error('Can only capture authorized payments');
        }
        this.status = PaymentStatus.CAPTURED;
        this.updatedAt = new Date().toISOString();
    };
    PaymentAggregate.prototype.cancel = function () {
        if (this.status === PaymentStatus.CAPTURED) {
            throw new Error('Cannot cancel captured payments');
        }
        this.status = PaymentStatus.CANCELLED;
        this.updatedAt = new Date().toISOString();
    };
    PaymentAggregate.prototype.fail = function () {
        this.status = PaymentStatus.FAILED;
        this.updatedAt = new Date().toISOString();
    };
    PaymentAggregate.prototype.toDTO = function () {
        return {
            id: this.id,
            orderId: this.orderId,
            amount: this.amount,
            currency: this.currency,
            status: this.status,
            authorizationCode: this.authorizationCode,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    };
    return PaymentAggregate;
}());
exports.PaymentAggregate = PaymentAggregate;
