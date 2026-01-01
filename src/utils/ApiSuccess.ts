// src/utils/ApiSuccess.ts

export class ApiSuccess<T = any> {
    public readonly success: boolean = true;
    public readonly timestamp: string = new Date().toISOString();

    constructor(
        public readonly message: string,
        public readonly data?: T,
        public readonly statusCode: number = 200,
        public readonly meta?: Record<string, any>
    ) { }

    // Static factory methods for common success responses
    static ok<T>(message: string, data?: T, meta?: Record<string, any>): ApiSuccess<T> {
        return new ApiSuccess(message, data, 200, meta);
    }

    static created<T>(message: string, data?: T, meta?: Record<string, any>): ApiSuccess<T> {
        return new ApiSuccess(message, data, 201, meta);
    }

    static accepted<T>(message: string, data?: T, meta?: Record<string, any>): ApiSuccess<T> {
        return new ApiSuccess(message, data, 202, meta);
    }

    static noContent(message: string = 'No content'): ApiSuccess<null> {
        return new ApiSuccess(message, null, 204);
    }

    // Convert to JSON response
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            ...(this.meta && { meta: this.meta }),
            timestamp: this.timestamp,
        };
    }

    // Send response directly
    send(res: any) {
        return res.status(this.statusCode).json(this.toJSON());
    }
}