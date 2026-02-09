import { v4 as uuidv4 } from 'uuid';
import { InventoryAggregate, Reservation } from '../domain/inventory';
import { InventoryRepository } from '../infrastructure/inventory-repository';
import { EventBus } from '@eventflow/event-bus';
import { InventoryReservedEvent, InventoryReleasedEvent, InventoryReservationFailedEvent } from '../domain/events';

export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private eventBus: EventBus
  ) {}

  async reserveInventory(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
    correlationId: string
  ): Promise<string> {
    const reservationId = uuidv4();

    try {
      for (const item of items) {
        const inventoryData = await this.inventoryRepository.findByProductId(item.productId);
        if (!inventoryData) {
          throw new Error(`Product ${item.productId} not found in inventory`);
        }

        const inventory = new InventoryAggregate(
          inventoryData.productId,
          inventoryData.availableStock,
          inventoryData.reservedStock,
          inventoryData.updatedAt
        );

        inventory.reserve(item.quantity);
        await this.inventoryRepository.saveInventory(inventory.toDTO());

        const reservation: Reservation = {
          id: reservationId,
          productId: item.productId,
          quantity: item.quantity,
          orderId,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.inventoryRepository.saveReservation(reservation);
      }

      const event: InventoryReservedEvent = {
        eventId: uuidv4(),
        type: 'InventoryReserved',
        occurredAt: new Date().toISOString(),
        aggregateId: reservationId,
        version: 1,
        correlationId,
        payload: {
          orderId,
          reservationId,
          items,
        },
      };

      await this.eventBus.publish(event);

      return reservationId;
    } catch (error: any) {
      const event: InventoryReservationFailedEvent = {
        eventId: uuidv4(),
        type: 'InventoryReservationFailed',
        occurredAt: new Date().toISOString(),
        aggregateId: orderId,
        version: 1,
        correlationId,
        payload: {
          orderId,
          reason: error.message,
        },
      };

      await this.eventBus.publish(event);

      throw error;
    }
  }

  async releaseReservation(reservationId: string, correlationId: string): Promise<void> {
    const reservations = await this.inventoryRepository.findReservationsByReservationId(reservationId);

    for (const reservation of reservations) {
      const inventoryData = await this.inventoryRepository.findByProductId(reservation.productId);
      if (inventoryData) {
        const inventory = new InventoryAggregate(
          inventoryData.productId,
          inventoryData.availableStock,
          inventoryData.reservedStock,
          inventoryData.updatedAt
        );

        inventory.release(reservation.quantity);
        await this.inventoryRepository.saveInventory(inventory.toDTO());
      }

      reservation.status = 'RELEASED';
      reservation.updatedAt = new Date().toISOString();
      await this.inventoryRepository.saveReservation(reservation);
    }

    const event: InventoryReleasedEvent = {
      eventId: uuidv4(),
      type: 'InventoryReleased',
      occurredAt: new Date().toISOString(),
      aggregateId: reservationId,
      version: 2,
      correlationId,
      payload: {
        orderId: reservations[0]?.orderId || '',
        reservationId,
      },
    };

    await this.eventBus.publish(event);
  }
}