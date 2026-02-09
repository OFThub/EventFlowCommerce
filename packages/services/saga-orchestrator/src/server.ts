import Fastify from 'fastify';
import cors from '@fastify/cors';
import { correlationMiddleware, createLogger } from '@eventflow/common';

export const createServer = async () => {
  const server = Fastify({
    logger: createLogger('saga-orchestrator'),
  });

  await server.register(cors);
  server.addHook('onRequest', correlationMiddleware);

  server.get('/health', async () => {
    return { status: 'ok', service: 'saga-orchestrator' };
  });

  return server;
};