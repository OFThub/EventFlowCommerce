import { FastifyInstance } from 'fastify';
import { CatalogService } from '../application/catalog-service';
import { ProductRepository } from '../infrastructure/product-repository';
import { EventBus } from '@eventflow/event-bus';
import { createSuccessResponse, createErrorResponse, getCorrelationId } from '@eventflow/common';

export const registerRoutes = async (server: FastifyInstance) => {
  const eventBus = new EventBus({
    adapter: (process.env.EVENT_BUS_ADAPTER as any) || 'local',
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      eventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'eventflow-commerce-bus',
      endpoint: process.env.AWS_ENDPOINT_URL,
    },
  });

  const productRepository = new ProductRepository();
  const catalogService = new CatalogService(productRepository, eventBus);

  server.get<{
    Querystring: { category?: string };
  }>('/catalog', async (request, reply) => {
    const correlationId = getCorrelationId(request);
    
    try {
      const products = await catalogService.listProducts(request.query.category);
      reply.send(createSuccessResponse(products, correlationId));
    } catch (error: any) {
      reply.code(500).send(createErrorResponse('CATALOG_ERROR', error.message, correlationId));
    }
  });

  server.get<{
    Params: { id: string };
  }>('/catalog/:id', async (request, reply) => {
    const correlationId = getCorrelationId(request);
    
    try {
      const product = await catalogService.getProduct(request.params.id);
      if (!product) {
        reply.code(404).send(createErrorResponse('NOT_FOUND', 'Product not found', correlationId));
        return;
      }
      reply.send(createSuccessResponse(product, correlationId));
    } catch (error: any) {
      reply.code(500).send(createErrorResponse('CATALOG_ERROR', error.message, correlationId));
    }
  });

  server.post<{
    Body: {
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
    };
  }>('/catalog', async (request, reply) => {
    const correlationId = getCorrelationId(request);
    
    try {
      const { name, description, price, category, stock } = request.body;
      const product = await catalogService.createProduct(
        name,
        description,
        price,
        category,
        stock,
        correlationId
      );
      reply.code(201).send(createSuccessResponse(product, correlationId));
    } catch (error: any) {
      reply.code(400).send(createErrorResponse('CREATE_FAILED', error.message, correlationId));
    }
  });

  server.get('/health', async () => {
    return { status: 'ok', service: 'catalog' };
  });
};