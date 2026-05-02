export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.status = statusCode >= 500 ? "error" : "fail"
        this.timestamp = new Date().toISOString()
    }
}

export class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400)
    }
}

export class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404)
    }
}

export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409)
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message) {
        super(message, 422)
    }
}