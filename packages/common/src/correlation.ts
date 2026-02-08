import { v4 as uuidv4 } from 'uuid';
import { FastifyRequest, FastifyReply } from 'fastify';

const CORRELATION_ID_HEADER = process.env.CORRELATION_ID_HEADER || 'x-correlation-id';

export const getCorrelationId = (request: FastifyRequest): string => {
  const existingId = request.headers[CORRELATION_ID_HEADER];
  return (Array.isArray(existingId) ? existingId[0] : existingId) || uuidv4();
};

export const correlationMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const correlationId = getCorrelationId(request);
  request.headers[CORRELATION_ID_HEADER] = correlationId;
  reply.header(CORRELATION_ID_HEADER, correlationId);
};

export const propagateCorrelationId = (headers: Record<string, any>): Record<string, string> => {
  const correlationId = headers[CORRELATION_ID_HEADER];
  return {
    [CORRELATION_ID_HEADER]: correlationId || uuidv4(),
  };
};