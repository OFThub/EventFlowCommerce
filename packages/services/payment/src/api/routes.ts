import { FastifyInstance } from 'fastify';
import { createSuccessResponse } from '@eventflow/common';

export const registerRoutes = async (server: FastifyInstance) => {
  server.get('/health', async () => {
    return { status: 'ok', service: 'payment' };
  });
};