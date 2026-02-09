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
exports.PlaceOrderSaga = void 0;
var uuid_1 = require("uuid");
var saga_state_1 = require("./saga-state");
var compensation_1 = require("./compensation");
var common_1 = require("@eventflow/common");
var logger = (0, common_1.createLogger)('place-order-saga');
var PlaceOrderSaga = /** @class */ (function () {
    function PlaceOrderSaga(sagaRepository, eventBus) {
        this.sagaRepository = sagaRepository;
        this.eventBus = eventBus;
    }
    PlaceOrderSaga.prototype.handleOrderCreated = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, customerId, items, shippingAddress, totalAmount, orderId, sagaState, reserveInventoryCommand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = event.payload, customerId = _a.customerId, items = _a.items, shippingAddress = _a.shippingAddress, totalAmount = _a.totalAmount;
                        orderId = event.aggregateId;
                        sagaState = {
                            sagaId: (0, uuid_1.v4)(),
                            orderId: orderId,
                            status: saga_state_1.SagaStatus.STARTED,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            correlationId: event.correlationId,
                        };
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 1:
                        _b.sent();
                        logger.info({ sagaId: sagaState.sagaId, orderId: orderId }, 'Saga started');
                        reserveInventoryCommand = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'ReserveInventory',
                            occurredAt: new Date().toISOString(),
                            aggregateId: orderId,
                            version: 1,
                            correlationId: event.correlationId,
                            payload: {
                                orderId: orderId,
                                items: items,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(reserveInventoryCommand)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.handleInventoryReserved = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, reservationId, sagaState, orderEvents, totalAmount, authorizePaymentCommand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = event.payload, orderId = _a.orderId, reservationId = _a.reservationId;
                        return [4 /*yield*/, this.sagaRepository.findByOrderId(orderId)];
                    case 1:
                        sagaState = _b.sent();
                        if (!sagaState) {
                            logger.error({ orderId: orderId }, 'Saga state not found');
                            return [2 /*return*/];
                        }
                        sagaState.status = saga_state_1.SagaStatus.INVENTORY_RESERVED;
                        sagaState.inventoryReservationId = reservationId;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 2:
                        _b.sent();
                        logger.info({ sagaId: sagaState.sagaId, reservationId: reservationId }, 'Inventory reserved');
                        return [4 /*yield*/, this.getOrderDetails(orderId)];
                    case 3:
                        orderEvents = _b.sent();
                        totalAmount = orderEvents.payload.totalAmount;
                        authorizePaymentCommand = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'AuthorizePayment',
                            occurredAt: new Date().toISOString(),
                            aggregateId: orderId,
                            version: 1,
                            correlationId: event.correlationId,
                            payload: {
                                orderId: orderId,
                                amount: totalAmount,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(authorizePaymentCommand)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.handlePaymentAuthorized = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, authorizationCode, paymentId, sagaState, orderEvents, shippingAddress, createShipmentCommand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = event.payload, orderId = _a.orderId, authorizationCode = _a.authorizationCode;
                        paymentId = event.aggregateId;
                        return [4 /*yield*/, this.sagaRepository.findByOrderId(orderId)];
                    case 1:
                        sagaState = _b.sent();
                        if (!sagaState) {
                            logger.error({ orderId: orderId }, 'Saga state not found');
                            return [2 /*return*/];
                        }
                        sagaState.status = saga_state_1.SagaStatus.PAYMENT_AUTHORIZED;
                        sagaState.paymentId = paymentId;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 2:
                        _b.sent();
                        logger.info({ sagaId: sagaState.sagaId, paymentId: paymentId }, 'Payment authorized');
                        return [4 /*yield*/, this.getOrderDetails(orderId)];
                    case 3:
                        orderEvents = _b.sent();
                        shippingAddress = orderEvents.payload.shippingAddress;
                        createShipmentCommand = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'CreateShipment',
                            occurredAt: new Date().toISOString(),
                            aggregateId: orderId,
                            version: 1,
                            correlationId: event.correlationId,
                            payload: {
                                orderId: orderId,
                                address: shippingAddress,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(createShipmentCommand)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.handleShipmentCreated = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, trackingNumber, shipmentId, sagaState, completeOrderCommand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = event.payload, orderId = _a.orderId, trackingNumber = _a.trackingNumber;
                        shipmentId = event.aggregateId;
                        return [4 /*yield*/, this.sagaRepository.findByOrderId(orderId)];
                    case 1:
                        sagaState = _b.sent();
                        if (!sagaState) {
                            logger.error({ orderId: orderId }, 'Saga state not found');
                            return [2 /*return*/];
                        }
                        sagaState.status = saga_state_1.SagaStatus.SHIPMENT_CREATED;
                        sagaState.shipmentId = shipmentId;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 2:
                        _b.sent();
                        logger.info({ sagaId: sagaState.sagaId, shipmentId: shipmentId }, 'Shipment created');
                        completeOrderCommand = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'CompleteOrder',
                            occurredAt: new Date().toISOString(),
                            aggregateId: orderId,
                            version: 1,
                            correlationId: event.correlationId,
                            payload: {
                                orderId: orderId,
                                shipmentId: shipmentId,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(completeOrderCommand)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.handleOrderCompleted = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, sagaState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderId = event.aggregateId;
                        return [4 /*yield*/, this.sagaRepository.findByOrderId(orderId)];
                    case 1:
                        sagaState = _a.sent();
                        if (!sagaState) {
                            logger.error({ orderId: orderId }, 'Saga state not found');
                            return [2 /*return*/];
                        }
                        sagaState.status = saga_state_1.SagaStatus.COMPLETED;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 2:
                        _a.sent();
                        logger.info({ sagaId: sagaState.sagaId, orderId: orderId }, 'Saga completed successfully');
                        return [4 /*yield*/, this.eventBus.publishToQueue('notification-queue', {
                                type: 'OrderConfirmed',
                                orderId: orderId,
                                customerEmail: 'customer@example.com',
                                correlationId: event.correlationId,
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.handleFailure = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, sagaState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderId = event.payload.orderId;
                        return [4 /*yield*/, this.sagaRepository.findByOrderId(orderId)];
                    case 1:
                        sagaState = _a.sent();
                        if (!sagaState) {
                            logger.error({ orderId: orderId }, 'Saga state not found');
                            return [2 /*return*/];
                        }
                        sagaState.status = saga_state_1.SagaStatus.COMPENSATING;
                        sagaState.failureReason = event.payload.reason;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 2:
                        _a.sent();
                        logger.warn({ sagaId: sagaState.sagaId, reason: event.payload.reason }, 'Starting compensation');
                        return [4 /*yield*/, this.compensate(sagaState)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.compensate = function (sagaState) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        if (!sagaState.shipmentId) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, compensation_1.compensateShipment)(sagaState.shipmentId, this.eventBus, sagaState.correlationId)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!sagaState.paymentId) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, compensation_1.compensatePayment)(sagaState.paymentId, this.eventBus, sagaState.correlationId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!sagaState.inventoryReservationId) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, compensation_1.compensateInventory)(sagaState.inventoryReservationId, this.eventBus, sagaState.correlationId)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, (0, compensation_1.compensateOrder)(sagaState.orderId, sagaState.failureReason || 'Saga failed', this.eventBus, sagaState.correlationId)];
                    case 7:
                        _a.sent();
                        sagaState.status = saga_state_1.SagaStatus.FAILED;
                        sagaState.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.sagaRepository.save(sagaState)];
                    case 8:
                        _a.sent();
                        logger.info({ sagaId: sagaState.sagaId }, 'Compensation completed');
                        return [4 /*yield*/, this.eventBus.publishToQueue('notification-queue', {
                                type: 'OrderCancelled',
                                orderId: sagaState.orderId,
                                customerEmail: 'customer@example.com',
                                correlationId: sagaState.correlationId,
                            })];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        logger.error({ error: error_1, sagaId: sagaState.sagaId }, 'Compensation failed');
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    PlaceOrderSaga.prototype.getOrderDetails = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        payload: {
                            totalAmount: 100,
                            shippingAddress: { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' },
                        },
                    }];
            });
        });
    };
    return PlaceOrderSaga;
}());
exports.PlaceOrderSaga = PlaceOrderSaga;
