import Fastify from 'fastify';
import cors from '@fastify/cors';
import { correlationMiddleware, createLogger } from '@eventflow/common';
import { registerRoutes } from './api/routes';

export const createServer = async () => {
  const server = Fastify({
    logger: createLogger('ordering-service'),
  });

  await server.register(cors);
  server.addHook('onRequest', correlationMiddleware);
  
  await registerRoutes(server);

  return server;
};