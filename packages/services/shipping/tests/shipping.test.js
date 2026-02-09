"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shipment_1 = require("../src/domain/shipment");
var uuid_1 = require("uuid");
describe('ShipmentAggregate', function () {
    it('should create a shipment', function () {
        var shipmentId = (0, uuid_1.v4)();
        var orderId = (0, uuid_1.v4)();
        var address = { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' };
        var shipment = shipment_1.ShipmentAggregate.create(shipmentId, orderId, address);
        expect(shipment.id).toBe(shipmentId);
        expect(shipment.orderId).toBe(orderId);
        expect(shipment.status).toBe(shipment_1.ShipmentStatus.PENDING);
    });
    it('should create shipment with tracking', function () {
        var shipment = shipment_1.ShipmentAggregate.create((0, uuid_1.v4)(), (0, uuid_1.v4)(), { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' });
        shipment.createShipment();
        expect(shipment.status).toBe(shipment_1.ShipmentStatus.CREATED);
        expect(shipment.trackingNumber).toBeDefined();
        expect(shipment.carrier).toBe('FEDEX');
    });
});
