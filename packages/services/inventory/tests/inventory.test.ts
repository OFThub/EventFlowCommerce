import { InventoryAggregate } from '../src/domain/inventory';
import { v4 as uuidv4 } from 'uuid';

describe('InventoryAggregate', () => {
  it('should create inventory', () => {
    const productId = uuidv4();
    const inventory = InventoryAggregate.create(productId, 100);

    expect(inventory.productId).toBe(productId);
    expect(inventory.availableStock).toBe(100);
    expect(inventory.reservedStock).toBe(0);
  });

  it('should reserve stock', () => {
    const inventory = InventoryAggregate.create(uuidv4(), 100);
    inventory.reserve(10);

    expect(inventory.availableStock).toBe(90);
    expect(inventory.reservedStock).toBe(10);
  });

  it('should throw error when insufficient stock', () => {
    const inventory = InventoryAggregate.create(uuidv4(), 5);

    expect(() => {
      inventory.reserve(10);
    }).toThrow('Insufficient stock');
  });

  it('should release reservation', () => {
    const inventory = InventoryAggregate.create(uuidv4(), 100);
    inventory.reserve(10);
    inventory.release(10);

    expect(inventory.availableStock).toBe(100);
    expect(inventory.reservedStock).toBe(0);
  });
});