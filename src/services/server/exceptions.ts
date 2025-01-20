import { StatusCodes } from 'http-status-codes';

export class ServerRequestError extends Error {
    constructor(public status: number, message?: string, public cause?: Error) {
        super(
            `error handling request, status(${status}): ${message}\n${cause}`
        );
    }
}

export class BadRequestError extends ServerRequestError {
    constructor(message?: string, cause?: Error) {
        super(StatusCodes.BAD_REQUEST, message, cause);
    }
}

export class UnauthorizedError extends ServerRequestError {
    constructor(message?: string, cause?: Error) {
        super(StatusCodes.UNAUTHORIZED, message, cause);
    }
}

export class InternalServerError extends ServerRequestError {
    constructor(message?: string, cause?: Error) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, message, cause);
    }
}
