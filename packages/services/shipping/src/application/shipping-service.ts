import { v4 as uuidv4 } from 'uuid';
import { ShipmentAggregate, Shipment, ShippingAddress } from '../domain/shipment';
import { ShipmentRepository } from '../infrastructure/shipment-repository';
import { EventBus } from '@eventflow/event-bus';
import { ShipmentCreatedEvent, ShipmentCancelledEvent } from '../domain/events';

export class ShippingService {
  constructor(
    private shipmentRepository: ShipmentRepository,
    private eventBus: EventBus
  ) {}

  async createShipment(orderId: string, address: ShippingAddress, correlationId: string): Promise<Shipment> {
    const shipmentId = uuidv4();
    const shipment = ShipmentAggregate.create(shipmentId, orderId, address);

    shipment.createShipment();
    await this.shipmentRepository.save(shipment.toDTO());

    const event: ShipmentCreatedEvent = {
      eventId: uuidv4(),
      type: 'ShipmentCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: shipmentId,
      version: 1,
      correlationId,
      payload: {
        orderId,
        trackingNumber: shipment.trackingNumber!,
        carrier: shipment.carrier!,
      },
    };

    await this.eventBus.publish(event);

    return shipment.toDTO();
  }

  async cancelShipment(shipmentId: string, correlationId: string): Promise<void> {
    const shipmentData = await this.shipmentRepository.findById(shipmentId);
    if (!shipmentData) {
      throw new Error('Shipment not found');
    }

    const shipment = new ShipmentAggregate(
      shipmentData.id,
      shipmentData.orderId,
      shipmentData.address,
      shipmentData.status,
      shipmentData.trackingNumber,
      shipmentData.carrier,
      shipmentData.createdAt,
      shipmentData.updatedAt
    );

    shipment.cancel();
    await this.shipmentRepository.save(shipment.toDTO());

    const event: ShipmentCancelledEvent = {
      eventId: uuidv4(),
      type: 'ShipmentCancelled',
      occurredAt: new Date().toISOString(),
      aggregateId: shipmentId,
      version: 2,
      correlationId,
      payload: {
        orderId: shipment.orderId,
      },
    };

    await this.eventBus.publish(event);
  }
}