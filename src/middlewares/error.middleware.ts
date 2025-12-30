import { Request, Response, NextFunction } from 'express';

// Custom Error Class
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Create specific errors easily
export const createError = (
    message: string,
    statusCode: number = 500,
    details?: any
) => new AppError(message, statusCode, details);

// Error handler middleware
const errorMiddleware = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = undefined;

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Handle validation errors (Joi, Zod, etc.)
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        details = (err as any).details;
    }
    // Handle MongoDB errors
    else if ((err as any).code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
        console.error({
            message: err.message,
            statusCode,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorMiddleware;