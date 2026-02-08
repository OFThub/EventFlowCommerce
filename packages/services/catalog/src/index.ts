import { createServer } from './server';
import { createLogger } from '@eventflow/common';

const logger = createLogger('catalog-service');
const PORT = parseInt(process.env.CATALOG_PORT || '3002', 10);

const start = async () => {
  try {
    const server = await createServer();
    await server.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Catalog service listening on port ${PORT}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();