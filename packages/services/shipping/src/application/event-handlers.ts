import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { ShipmentRepository } from '../infrastructure/shipment-repository';
import { ShippingService } from './shipping-service';

export class ShippingEventHandler {
  private shippingService: ShippingService;

  constructor(
    private shipmentRepository: ShipmentRepository,
    private eventBus: EventBus
  ) {
    this.shippingService = new ShippingService(shipmentRepository, eventBus);
  }

  async start(): Promise<void> {
    await this.eventBus.subscribe('CreateShipment', this.handleCreateShipment.bind(this));
    await this.eventBus.subscribe('CancelShipment', this.handleCancelShipment.bind(this));
  }

  private async handleCreateShipment(event: DomainEvent): Promise<void> {
    const { orderId, address } = event.payload;
    try {
      await this.shippingService.createShipment(orderId, address, event.correlationId);
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  }

  private async handleCancelShipment(event: DomainEvent): Promise<void> {
    const { shipmentId } = event.payload;
    try {
      await this.shippingService.cancelShipment(shipmentId, event.correlationId);
    } catch (error) {
      console.error('Error cancelling shipment:', error);
    }
  }
}