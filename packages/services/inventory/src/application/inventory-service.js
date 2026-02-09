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
exports.InventoryService = void 0;
var uuid_1 = require("uuid");
var inventory_1 = require("../domain/inventory");
var InventoryService = /** @class */ (function () {
    function InventoryService(inventoryRepository, eventBus) {
        this.inventoryRepository = inventoryRepository;
        this.eventBus = eventBus;
    }
    InventoryService.prototype.reserveInventory = function (orderId, items, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var reservationId, _i, items_1, item, inventoryData, inventory, reservation, event_1, error_1, event_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reservationId = (0, uuid_1.v4)();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 11]);
                        _i = 0, items_1 = items;
                        _a.label = 2;
                    case 2:
                        if (!(_i < items_1.length)) return [3 /*break*/, 7];
                        item = items_1[_i];
                        return [4 /*yield*/, this.inventoryRepository.findByProductId(item.productId)];
                    case 3:
                        inventoryData = _a.sent();
                        if (!inventoryData) {
                            throw new Error("Product ".concat(item.productId, " not found in inventory"));
                        }
                        inventory = new inventory_1.InventoryAggregate(inventoryData.productId, inventoryData.availableStock, inventoryData.reservedStock, inventoryData.updatedAt);
                        inventory.reserve(item.quantity);
                        return [4 /*yield*/, this.inventoryRepository.saveInventory(inventory.toDTO())];
                    case 4:
                        _a.sent();
                        reservation = {
                            id: reservationId,
                            productId: item.productId,
                            quantity: item.quantity,
                            orderId: orderId,
                            status: 'ACTIVE',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        return [4 /*yield*/, this.inventoryRepository.saveReservation(reservation)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        event_1 = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'InventoryReserved',
                            occurredAt: new Date().toISOString(),
                            aggregateId: reservationId,
                            version: 1,
                            correlationId: correlationId,
                            payload: {
                                orderId: orderId,
                                reservationId: reservationId,
                                items: items,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event_1)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, reservationId];
                    case 9:
                        error_1 = _a.sent();
                        event_2 = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'InventoryReservationFailed',
                            occurredAt: new Date().toISOString(),
                            aggregateId: orderId,
                            version: 1,
                            correlationId: correlationId,
                            payload: {
                                orderId: orderId,
                                reason: error_1.message,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event_2)];
                    case 10:
                        _a.sent();
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    InventoryService.prototype.releaseReservation = function (reservationId, correlationId) {
        return __awaiter(this, void 0, void 0, function () {
            var reservations, _i, reservations_1, reservation, inventoryData, inventory, event;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.inventoryRepository.findReservationsByReservationId(reservationId)];
                    case 1:
                        reservations = _b.sent();
                        _i = 0, reservations_1 = reservations;
                        _b.label = 2;
                    case 2:
                        if (!(_i < reservations_1.length)) return [3 /*break*/, 8];
                        reservation = reservations_1[_i];
                        return [4 /*yield*/, this.inventoryRepository.findByProductId(reservation.productId)];
                    case 3:
                        inventoryData = _b.sent();
                        if (!inventoryData) return [3 /*break*/, 5];
                        inventory = new inventory_1.InventoryAggregate(inventoryData.productId, inventoryData.availableStock, inventoryData.reservedStock, inventoryData.updatedAt);
                        inventory.release(reservation.quantity);
                        return [4 /*yield*/, this.inventoryRepository.saveInventory(inventory.toDTO())];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        reservation.status = 'RELEASED';
                        reservation.updatedAt = new Date().toISOString();
                        return [4 /*yield*/, this.inventoryRepository.saveReservation(reservation)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        event = {
                            eventId: (0, uuid_1.v4)(),
                            type: 'InventoryReleased',
                            occurredAt: new Date().toISOString(),
                            aggregateId: reservationId,
                            version: 2,
                            correlationId: correlationId,
                            payload: {
                                orderId: ((_a = reservations[0]) === null || _a === void 0 ? void 0 : _a.orderId) || '',
                                reservationId: reservationId,
                            },
                        };
                        return [4 /*yield*/, this.eventBus.publish(event)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return InventoryService;
}());
exports.InventoryService = InventoryService;
