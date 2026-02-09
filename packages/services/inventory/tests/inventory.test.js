"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inventory_1 = require("../src/domain/inventory");
var uuid_1 = require("uuid");
describe('InventoryAggregate', function () {
    it('should create inventory', function () {
        var productId = (0, uuid_1.v4)();
        var inventory = inventory_1.InventoryAggregate.create(productId, 100);
        expect(inventory.productId).toBe(productId);
        expect(inventory.availableStock).toBe(100);
        expect(inventory.reservedStock).toBe(0);
    });
    it('should reserve stock', function () {
        var inventory = inventory_1.InventoryAggregate.create((0, uuid_1.v4)(), 100);
        inventory.reserve(10);
        expect(inventory.availableStock).toBe(90);
        expect(inventory.reservedStock).toBe(10);
    });
    it('should throw error when insufficient stock', function () {
        var inventory = inventory_1.InventoryAggregate.create((0, uuid_1.v4)(), 5);
        expect(function () {
            inventory.reserve(10);
        }).toThrow('Insufficient stock');
    });
    it('should release reservation', function () {
        var inventory = inventory_1.InventoryAggregate.create((0, uuid_1.v4)(), 100);
        inventory.reserve(10);
        inventory.release(10);
        expect(inventory.availableStock).toBe(100);
        expect(inventory.reservedStock).toBe(0);
    });
});
