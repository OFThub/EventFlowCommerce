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
exports.compensatePayment = compensatePayment;
exports.compensateInventory = compensateInventory;
exports.compensateShipment = compensateShipment;
exports.compensateOrder = compensateOrder;
var uuid_1 = require("uuid");
var common_1 = require("@eventflow/common");
var logger = (0, common_1.createLogger)('saga-compensation');
function compensatePayment(paymentId, eventBus, correlationId) {
    return __awaiter(this, void 0, void 0, function () {
        var cancelPaymentCommand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info({ paymentId: paymentId }, 'Compensating payment');
                    cancelPaymentCommand = {
                        eventId: (0, uuid_1.v4)(),
                        type: 'CancelPayment',
                        occurredAt: new Date().toISOString(),
                        aggregateId: paymentId,
                        version: 1,
                        correlationId: correlationId,
                        payload: {
                            paymentId: paymentId,
                        },
                    };
                    return [4 /*yield*/, eventBus.publish(cancelPaymentCommand)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function compensateInventory(reservationId, eventBus, correlationId) {
    return __awaiter(this, void 0, void 0, function () {
        var releaseInventoryCommand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info({ reservationId: reservationId }, 'Compensating inventory');
                    releaseInventoryCommand = {
                        eventId: (0, uuid_1.v4)(),
                        type: 'ReleaseInventory',
                        occurredAt: new Date().toISOString(),
                        aggregateId: reservationId,
                        version: 1,
                        correlationId: correlationId,
                        payload: {
                            reservationId: reservationId,
                        },
                    };
                    return [4 /*yield*/, eventBus.publish(releaseInventoryCommand)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function compensateShipment(shipmentId, eventBus, correlationId) {
    return __awaiter(this, void 0, void 0, function () {
        var cancelShipmentCommand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info({ shipmentId: shipmentId }, 'Compensating shipment');
                    cancelShipmentCommand = {
                        eventId: (0, uuid_1.v4)(),
                        type: 'CancelShipment',
                        occurredAt: new Date().toISOString(),
                        aggregateId: shipmentId,
                        version: 1,
                        correlationId: correlationId,
                        payload: {
                            shipmentId: shipmentId,
                        },
                    };
                    return [4 /*yield*/, eventBus.publish(cancelShipmentCommand)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function compensateOrder(orderId, reason, eventBus, correlationId) {
    return __awaiter(this, void 0, void 0, function () {
        var cancelOrderCommand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info({ orderId: orderId, reason: reason }, 'Compensating order');
                    cancelOrderCommand = {
                        eventId: (0, uuid_1.v4)(),
                        type: 'CancelOrder',
                        occurredAt: new Date().toISOString(),
                        aggregateId: orderId,
                        version: 1,
                        correlationId: correlationId,
                        payload: {
                            orderId: orderId,
                            reason: reason,
                        },
                    };
                    return [4 /*yield*/, eventBus.publish(cancelOrderCommand)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
