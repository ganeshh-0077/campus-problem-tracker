import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Protect internal database connection strings, passwords or stack traces
  const clientMessage =
    err instanceof AppError
      ? err.message
      : statusCode < 500
      ? err.message || 'Client error'
      : 'An unexpected internal server error occurred. Please contact the administrator.';

  if (statusCode >= 500) {
    console.error('[SERVER ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(isDevelopment && statusCode >= 500 ? { stack: err.stack, raw: err.message } : {}),
  });
};
