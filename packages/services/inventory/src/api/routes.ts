import { FastifyInstance } from 'fastify';

export const registerRoutes = async (server: FastifyInstance) => {
  server.get('/health', async () => {
    return { status: 'ok', service: 'inventory' };
  });
};