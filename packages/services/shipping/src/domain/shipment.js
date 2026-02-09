"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentAggregate = exports.ShipmentStatus = void 0;
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "PENDING";
    ShipmentStatus["CREATED"] = "CREATED";
    ShipmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentStatus["DELIVERED"] = "DELIVERED";
    ShipmentStatus["CANCELLED"] = "CANCELLED";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var ShipmentAggregate = /** @class */ (function () {
    function ShipmentAggregate(id, orderId, address, status, trackingNumber, carrier, createdAt, updatedAt) {
        this.id = id;
        this.orderId = orderId;
        this.address = address;
        this.status = status;
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    ShipmentAggregate.create = function (id, orderId, address) {
        var now = new Date().toISOString();
        return new ShipmentAggregate(id, orderId, address, ShipmentStatus.PENDING, undefined, undefined, now, now);
    };
    ShipmentAggregate.prototype.createShipment = function (carrier) {
        if (carrier === void 0) { carrier = 'FEDEX'; }
        if (this.status !== ShipmentStatus.PENDING) {
            throw new Error('Can only create pending shipments');
        }
        this.status = ShipmentStatus.CREATED;
        this.trackingNumber = "TRK-".concat(Date.now());
        this.carrier = carrier;
        this.updatedAt = new Date().toISOString();
    };
    ShipmentAggregate.prototype.cancel = function () {
        if (this.status === ShipmentStatus.DELIVERED) {
            throw new Error('Cannot cancel delivered shipments');
        }
        this.status = ShipmentStatus.CANCELLED;
        this.updatedAt = new Date().toISOString();
    };
    ShipmentAggregate.prototype.toDTO = function () {
        return {
            id: this.id,
            orderId: this.orderId,
            address: this.address,
            status: this.status,
            trackingNumber: this.trackingNumber,
            carrier: this.carrier,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    };
    return ShipmentAggregate;
}());
exports.ShipmentAggregate = ShipmentAggregate;
