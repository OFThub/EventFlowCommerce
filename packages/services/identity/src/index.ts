import { createServer } from './server';
import { createLogger } from '@eventflow/common';

const logger = createLogger('identity-service');
const PORT = parseInt(process.env.IDENTITY_PORT || '3001', 10);

const start = async () => {
  try {
    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Identity service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();