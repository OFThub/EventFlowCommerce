import { ShipmentAggregate, ShipmentStatus } from '../src/domain/shipment';
import { v4 as uuidv4 } from 'uuid';

describe('ShipmentAggregate', () => {
  it('should create a shipment', () => {
    const shipmentId = uuidv4();
    const orderId = uuidv4();
    const address = { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' };
    const shipment = ShipmentAggregate.create(shipmentId, orderId, address);

    expect(shipment.id).toBe(shipmentId);
    expect(shipment.orderId).toBe(orderId);
    expect(shipment.status).toBe(ShipmentStatus.PENDING);
  });

  it('should create shipment with tracking', () => {
    const shipment = ShipmentAggregate.create(
      uuidv4(),
      uuidv4(),
      { street: '123 Main', city: 'Seattle', state: 'WA', zip: '98101' }
    );
    
    shipment.createShipment();

    expect(shipment.status).toBe(ShipmentStatus.CREATED);
    expect(shipment.trackingNumber).toBeDefined();
    expect(shipment.carrier).toBe('FEDEX');
  });
});