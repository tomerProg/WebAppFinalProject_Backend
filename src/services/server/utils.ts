import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
    BadRequestError,
    InternalServerError,
    ServerRequestError
} from './exceptions';

export const expressAppRoutesErrorHandler = (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
) => {
    if (error instanceof ServerRequestError) {
        console.error('server request error: ', error.cause);
        response.status(error.status).send(error.message);
    } else {
        console.error('unknown error: ', error);
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
};

export const validateRequest =
    <T>(schema: z.Schema<T>, badRequestMessage?: string) =>
    (
        handler: (
            request: T,
            response: Response,
            next: NextFunction
        ) => void | Promise<void>
    ) =>
    async (request: Request, response: Response, next: NextFunction) => {
        const requestValidation = schema.safeParse(request);
        try {
            if (requestValidation.error) {
                throw new BadRequestError(
                    badRequestMessage ?? 'invalid request',
                    requestValidation.error
                );
            }
            await handler(requestValidation.data, response, next);
        } catch (error) {
            const handlerError =
                error instanceof ServerRequestError
                    ? error
                    : new InternalServerError('handler error', error as Error);
            next(handlerError);
        }
    };
