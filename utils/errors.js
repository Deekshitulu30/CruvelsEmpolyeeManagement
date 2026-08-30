class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403);
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

module.exports = { AppError, NotFoundError, ForbiddenError, ConflictError, ValidationError };
