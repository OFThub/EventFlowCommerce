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
exports.SagaCoordinator = void 0;
var place_order_saga_1 = require("../saga/place-order-saga");
var common_1 = require("@eventflow/common");
var logger = (0, common_1.createLogger)('saga-coordinator');
var SagaCoordinator = /** @class */ (function () {
    function SagaCoordinator(sagaRepository, eventBus) {
        this.sagaRepository = sagaRepository;
        this.eventBus = eventBus;
        this.saga = new place_order_saga_1.PlaceOrderSaga(sagaRepository, eventBus);
    }
    SagaCoordinator.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.eventBus.subscribe('OrderCreated', this.handleOrderCreated.bind(this))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('InventoryReserved', this.handleInventoryReserved.bind(this))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('PaymentAuthorized', this.handlePaymentAuthorized.bind(this))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('ShipmentCreated', this.handleShipmentCreated.bind(this))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('OrderCompleted', this.handleOrderCompleted.bind(this))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('InventoryReservationFailed', this.handleFailure.bind(this))];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.eventBus.subscribe('PaymentFailed', this.handleFailure.bind(this))];
                    case 7:
                        _a.sent();
                        logger.info('Saga coordinator subscribed to events');
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handleOrderCreated = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handleOrderCreated(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handleInventoryReserved = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handleInventoryReserved(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handlePaymentAuthorized = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handlePaymentAuthorized(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handleShipmentCreated = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handleShipmentCreated(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handleOrderCompleted = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handleOrderCompleted(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SagaCoordinator.prototype.handleFailure = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saga.handleFailure(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SagaCoordinator;
}());
exports.SagaCoordinator = SagaCoordinator;
