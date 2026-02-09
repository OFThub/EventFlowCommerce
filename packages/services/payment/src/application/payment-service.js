"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
var uuid_1 = require("uuid");
var payment_1 = require("../domain/payment");
var PaymentService = /** @class */ (function () {
    function PaymentService(paymentRepository, eventBus) {
        this.paymentRepository = paymentRepository;
        this.eventBus = eventBus;
    }
    PaymentService.prototype.authorizePayment = function (orderId, amount, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentId, payment, event_1, error_1, event_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paymentId = (0, uuid_1.v4)();
                        payment = payment_1.PaymentAggregate.create(paymentId, orderId, amount);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 8]);
                        return [4 /*yield*/, this.simulatePaymentGateway(amount)];
                    case 2:
                        _a.sent();
                        payment.authorize();
                        return [4 /*yield*/, this.paymentRepository.save(payment.toDTO())];
                    case 3:
                        _a.sent();
                        event_1 = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'PaymentAuthorized',
                            occurredAt: new Date().toISOString(),
                            aggregateId: paymentId,
                            version: 1,
                            correlationId: correlationId,
                            payload: {
                                orderId: orderId,
                                amount: amount,
                                authorizationCode: payment.authorizationCode,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event_1)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, payment.toDTO()];
                    case 5:
                        error_1 = _a.sent();
                        payment.fail();
                        return [4 /*yield*/, this.paymentRepository.save(payment.toDTO())];
                    case 6:
                        _a.sent();
                        event_2 = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'PaymentFailed',
                            occurredAt: new Date().toISOString(),
                            aggregateId: paymentId,
                            version: 1,
                            correlationId: correlationId,
                            payload: {
                                orderId: orderId,
                                reason: error_1.message,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event_2)];
                    case 7:
                        _a.sent();
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.cancelPayment = function (paymentId, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentData, payment, event;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.paymentRepository.findById(paymentId)];
                    case 1:
                        paymentData = _a.sent();
                        if (!paymentData) {
                            throw new Error('Payment not found');
                        }
                        payment = new payment_1.PaymentAggregate(paymentData.id, paymentData.orderId, paymentData.amount, paymentData.currency, paymentData.status, paymentData.authorizationCode, paymentData.createdAt, paymentData.updatedAt);
                        payment.cancel();
                        return [4 /*yield*/, this.paymentRepository.save(payment.toDTO())];
                    case 2:
                        _a.sent();
                        event = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'PaymentCancelled',
                            occurredAt: new Date().toISOString(),
                            aggregateId: paymentId,
                            version: 2,
                            correlationId: correlationId,
                            payload: {
                                orderId: payment.orderId,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.simulatePaymentGateway = function (amount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 1:
                        _a.sent();
                        if (Math.random() < 0.05) {
                            throw new Error('Payment gateway error');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PaymentService;
}());
exports.PaymentService = PaymentService;
