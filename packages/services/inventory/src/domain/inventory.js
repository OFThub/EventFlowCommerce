"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAggregate = void 0;
var InventoryAggregate = /** @class */ (function () {
    function InventoryAggregate(productId, availableStock, reservedStock, updatedAt) {
        this.productId = productId;
        this.availableStock = availableStock;
        this.reservedStock = reservedStock;
        this.updatedAt = updatedAt;
    }
    InventoryAggregate.create = function (productId, initialStock) {
        return new InventoryAggregate(productId, initialStock, 0, new Date().toISOString());
    };
    InventoryAggregate.prototype.reserve = function (quantity) {
        if (this.availableStock < quantity) {
            throw new Error('Insufficient stock');
        }
        this.availableStock -= quantity;
        this.reservedStock += quantity;
        this.updatedAt = new Date().toISOString();
    };
    InventoryAggregate.prototype.release = function (quantity) {
        this.reservedStock -= quantity;
        this.availableStock += quantity;
        this.updatedAt = new Date().toISOString();
    };
    InventoryAggregate.prototype.commit = function (quantity) {
        this.reservedStock -= quantity;
        this.updatedAt = new Date().toISOString();
    };
    InventoryAggregate.prototype.toDTO = function () {
        return {
            productId: this.productId,
            availableStock: this.availableStock,
            reservedStock: this.reservedStock,
            updatedAt: this.updatedAt,
        };
    };
    return InventoryAggregate;
}());
exports.InventoryAggregate = InventoryAggregate;
