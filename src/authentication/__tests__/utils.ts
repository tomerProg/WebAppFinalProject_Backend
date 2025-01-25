import { Express, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { User, UserModel } from '../../users/model';
import { AuthenticatedRequest } from '../types';
import { Post } from '../../posts/model';

export const createUserAuthenticationToken = async (
    app: Express,
    user: User
) => {
    const oldTokenExpire = process.env.TOKEN_EXPIRES;
    process.env.TOKEN_EXPIRES = '3h';
    const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
    const loginResponse = await request(app).post('/auth/login').send(user);
    process.env.TOKEN_EXPIRES = oldTokenExpire;
    if (
        registerResponse.status !== StatusCodes.CREATED ||
        !loginResponse.body.accessToken
    ) {
        throw new Error('failed creating auth token');
    }

    return loginResponse.body.accessToken;
};

export const createTestingAuthMiddlewareWithUser =
    (user: User & { _id: Types.ObjectId }) =>
    (request: Request, _response: Response, next: NextFunction) => {
        (request as unknown as AuthenticatedRequest).user = {
            id: user._id.toString()
        };
        next();
    };

// export const createTestingAuthMiddlewareWithPost =
//     (post: Post & { _id: Types.ObjectId }) =>
//     (request: Request, _response: Response, next: NextFunction) => {
//         (request as unknown as AuthenticatedRequest).user = {
//             id: post._id.toString()
//         };
//         next();
//     };
