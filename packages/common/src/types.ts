export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    correlationId: string;
    timestamp: string;
  };
}

export const createSuccessResponse = <T>(data: T, correlationId: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    metadata: {
      correlationId,
      timestamp: new Date().toISOString(),
    },
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  correlationId: string,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      correlationId,
      timestamp: new Date().toISOString(),
    },
  };
};