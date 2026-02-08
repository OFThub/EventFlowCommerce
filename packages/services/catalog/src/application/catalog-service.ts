import { v4 as uuidv4 } from 'uuid';
import { ProductAggregate, Product } from '../domain/product';
import { ProductRepository } from '../infrastructure/product-repository';
import { EventBus } from '@eventflow/event-bus';
import { ProductCreatedEvent } from '../domain/events';

export class CatalogService {
  constructor(
    private productRepository: ProductRepository,
    private eventBus: EventBus
  ) {}

  async createProduct(
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number,
    correlationId: string
  ): Promise<Product> {
    const productId = uuidv4();
    const product = ProductAggregate.create(productId, name, description, price, category, stock);

    await this.productRepository.save(product.toDTO());

    const event: ProductCreatedEvent = {
      eventId: uuidv4(),
      type: 'ProductCreated',
      occurredAt: new Date().toISOString(),
      aggregateId: productId,
      version: 1,
      correlationId,
      payload: {
        name: product.name,
        price: product.price,
        category: product.category,
      },
    };

    await this.eventBus.publish(event);

    return product.toDTO();
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async listProducts(category?: string): Promise<Product[]> {
    return this.productRepository.findAll(category);
  }
}