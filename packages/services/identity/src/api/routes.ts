import { FastifyInstance } from 'fastify';
import { AuthService } from '../application/auth-service';
import { UserRepository } from '../infrastructure/user-repository';
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

  const userRepository = new UserRepository();
  const authService = new AuthService(userRepository, eventBus);

  server.post<{
    Body: { email: string; password: string };
  }>('/auth/register', async (request, reply) => {
    const correlationId = getCorrelationId(request);
    
    try {
      const { email, password } = request.body;
      const result = await authService.register(email, password, correlationId);
      reply.code(201).send(createSuccessResponse(result, correlationId));
    } catch (error: any) {
      reply.code(400).send(createErrorResponse('REGISTER_FAILED', error.message, correlationId));
    }
  });

  server.post<{
    Body: { email: string; password: string };
  }>('/auth/login', async (request, reply) => {
    const correlationId = getCorrelationId(request);
    
    try {
      const { email, password } = request.body;
      const result = await authService.login(email, password, correlationId);
      reply.send(createSuccessResponse(result, correlationId));
    } catch (error: any) {
      reply.code(401).send(createErrorResponse('LOGIN_FAILED', error.message, correlationId));
    }
  });

  server.get('/health', async () => {
    return { status: 'ok', service: 'identity' };
  });
};