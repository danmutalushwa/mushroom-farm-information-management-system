/**
 * API Response Utility
 * Standardized response format for all API endpoints
 */
class ApiResponse {
    /**
     * Success response
     */
    static success(data, message = 'Success', statusCode = 200) {
        return {
            status: 'success',
            message,
            data,
            timestamp: new Date().toISOString(),
            statusCode
        };
    }

    /**
     * Error response
     */
    static error(message, statusCode = 500, errors = null) {
        return {
            status: 'error',
            message,
            errors,
            timestamp: new Date().toISOString(),
            statusCode
        };
    }

    /**
     * Paginated response
     */
    static paginated(data, pagination, message = 'Success') {
        return {
            status: 'success',
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: pagination.pages
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Created response
     */
    static created(data, message = 'Resource created successfully') {
        return this.success(data, message, 201);
    }

    /**
     * No content response
     */
    static noContent(message = 'No content') {
        return {
            status: 'success',
            message,
            timestamp: new Date().toISOString(),
            statusCode: 204
        };
    }

    /**
     * Bad request response
     */
    static badRequest(message = 'Bad request', errors = null) {
        return this.error(message, 400, errors);
    }

    /**
     * Unauthorized response
     */
    static unauthorized(message = 'Unauthorized') {
        return this.error(message, 401);
    }

    /**
     * Forbidden response
     */
    static forbidden(message = 'Forbidden') {
        return this.error(message, 403);
    }

    /**
     * Not found response
     */
    static notFound(message = 'Resource not found') {
        return this.error(message, 404);
    }
}

module.exports = ApiResponse;