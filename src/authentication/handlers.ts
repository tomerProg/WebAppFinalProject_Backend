import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GoogleAuthClient } from '../googleAuth/google.auth';
import {
    BadRequestError,
    InternalServerError,
    ServerRequestError
} from '../services/server/exceptions';
import { UserModel } from '../users/model';
import { AuthConfig } from './config';
import { generateTokens, hashPassword, verifyRefreshToken } from './utils';
import { validateRequestWithUserInBody } from './validators';

export const register = (userModel: UserModel) =>
    validateRequestWithUserInBody(async (request, response) => {
        const user = request.body;
        const hashedPassword = await hashPassword(user.password);
        try {
            await userModel.create({ ...user, password: hashedPassword });
            response.sendStatus(StatusCodes.CREATED);
        } catch (err) {
            const error = err as Error;
            if ('code' in error && error.code === 11000) {
                throw new BadRequestError('failed register');
            }
            throw error;
        }
    });

export const login = (authConfig: AuthConfig, userModel: UserModel) =>
    validateRequestWithUserInBody(async (request, response, next) => {
        const { email, password } = request.body;
        try {
            const user = await userModel.findOne({ email });
            if (!user) {
                throw new BadRequestError('wrong username or password');
            }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new BadRequestError('wrong username or password');
            }
            const userId = user._id.toString();
            const tokens = generateTokens(authConfig, userId);
            if (!tokens) {
                throw new InternalServerError();
            }
            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();
            response.send({ ...tokens, _id: userId });
        } catch (err) {
            next(
                err instanceof ServerRequestError
                    ? err
                    : new BadRequestError('failed to login', err as Error)
            );
        }
    });

export const logout =
    (tokenSecret: string) => async (req: Request, res: Response) => {
        try {
            const user = await verifyRefreshToken(
                tokenSecret,
                req.body.refreshToken
            );
            await user.save();
            res.sendStatus(StatusCodes.OK);
        } catch (err) {
            res.status(StatusCodes.BAD_REQUEST).send(err);
        }
    };

export const refresh =
    (authConfig: AuthConfig) => async (req: Request, res: Response) => {
        try {
            const user = await verifyRefreshToken(
                authConfig.tokenSecret,
                req.body.refreshToken
            );
            const userId = user._id.toString();
            const tokens = generateTokens(authConfig, userId);

            if (!tokens) {
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                return;
            }
            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();
            res.send({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: userId
            });
        } catch (err) {
            res.status(StatusCodes.BAD_REQUEST).send(err);
        }
    };

export const googleLogin =
    (
        authConfig: AuthConfig,
        userModel: UserModel,
        googleAuthClient: GoogleAuthClient
    ) =>
    async (request: Request, response: Response) => {
        const credential = request.body.credential;
        const googlePatload = await googleAuthClient.verifyCredential(
            credential
        );
        try {
            const email = googlePatload.email;
            const unknownExistUser = await userModel.findOne({ email });
            const user = unknownExistUser
                ? unknownExistUser
                : await userModel.create({
                      email: email,
                      imgUrl: googlePatload.picture,
                      password: 'google-signin'
                  });
            const userId = user._id.toString();
            const tokens = await generateTokens(authConfig, userId);

            response.send({ ...tokens, _id: userId });
        } catch (err) {
            throw new BadRequestError(
                'error missing email or password',
                err as Error
            );
        }
    };
