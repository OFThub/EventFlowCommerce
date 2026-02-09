import { EventBus, DomainEvent } from '@eventflow/event-bus';
import { InventoryRepository } from '../infrastructure/inventory-repository';
import { InventoryService } from './inventory-service';

export class InventoryEventHandler {
  private inventoryService: InventoryService;

  constructor(
    private inventoryRepository: InventoryRepository,
    private eventBus: EventBus
  ) {
    this.inventoryService = new InventoryService(inventoryRepository, eventBus);
  }

  async start(): Promise<void> {
    await this.eventBus.subscribe('ReserveInventory', this.handleReserveInventory.bind(this));
    await this.eventBus.subscribe('ReleaseInventory', this.handleReleaseInventory.bind(this));
  }

  private async handleReserveInventory(event: DomainEvent): Promise<void> {
    const { orderId, items } = event.payload;
    try {
      await this.inventoryService.reserveInventory(orderId, items, event.correlationId);
    } catch (error) {
      console.error('Error reserving inventory:', error);
    }
  }

  private async handleReleaseInventory(event: DomainEvent): Promise<void> {
    const { reservationId } = event.payload;
    try {
      await this.inventoryService.releaseReservation(reservationId, event.correlationId);
    } catch (error) {
      console.error('Error releasing inventory:', error);
    }
  }
}