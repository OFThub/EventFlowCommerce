import { CatalogService } from '../src/application/catalog-service';
import { ProductRepository } from '../src/infrastructure/product-repository';
import { EventBus } from '@eventflow/event-bus';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../src/infrastructure/product-repository');
jest.mock('@eventflow/event-bus');

describe('CatalogService', () => {
  let catalogService: CatalogService;
  let productRepository: jest.Mocked<ProductRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    productRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    eventBus = new EventBus({ adapter: 'local' }) as jest.Mocked<EventBus>;
    catalogService = new CatalogService(productRepository, eventBus);
  });

  it('should create a product', async () => {
    productRepository.save.mockResolvedValue();
    eventBus.publish.mockResolvedValue();

    const product = await catalogService.createProduct(
      'Test Product',
      'Description',
      99.99,
      'Electronics',
      10,
      uuidv4()
    );

    expect(product.name).toBe('Test Product');
    expect(productRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ProductCreated',
      })
    );
  });
});