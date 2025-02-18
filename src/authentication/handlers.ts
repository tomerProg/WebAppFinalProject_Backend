import bcrypt from 'bcrypt';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { GoogleAuthClient } from '../googleAuth/google.auth';
import {
    BadRequestError,
    InternalServerError,
    ServerRequestError
} from '../services/server/exceptions';
import { UserModel } from '../users/model';
import { AuthConfig, REFRESH_TOKEN_COOKIE_NAME } from './config';
import { Tokens } from './types';
import { generateTokens, hashPassword, verifyRefreshToken } from './utils';
import {
    validateGoogleLoginRequest,
    validateLoginRequest,
    validateRequestWithRefreshToken,
    validateRequestWithUserInBody
} from './validators';

const responseSendTokensAndUserId = (
    response: Response,
    userId: string | Types.ObjectId,
    tokens: Tokens
) => {
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
        sameSite: 'strict',
        httpOnly: true
    });
    response.send({ accessToken: tokens.accessToken, _id: userId });
};

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
    validateLoginRequest(async (request, response, next) => {
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
            responseSendTokensAndUserId(response, userId, tokens);
        } catch (err) {
            next(
                err instanceof ServerRequestError
                    ? err
                    : new BadRequestError('failed to login', err as Error)
            );
        }
    });

export const logout = (tokenSecret: string) =>
    validateRequestWithRefreshToken(async (request, response) => {
        try {
            const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
            const user = await verifyRefreshToken(tokenSecret, refreshToken);
            await user.save();
            response.sendStatus(StatusCodes.OK);
        } catch (err) {
            response.status(StatusCodes.BAD_REQUEST).send(err);
        }
    });

export const refresh = (authConfig: AuthConfig) =>
    validateRequestWithRefreshToken(async (request, response) => {
        const { tokenSecret } = authConfig;
        const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];

        try {
            const user = await verifyRefreshToken(tokenSecret, refreshToken);
            const userId = user._id.toString();
            const tokens = generateTokens(authConfig, userId);

            if (!tokens) {
                response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                return;
            }
            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();
            responseSendTokensAndUserId(response, userId, tokens);
        } catch (err) {
            response.status(StatusCodes.BAD_REQUEST).send(err);
        }
    });

export const googleLogin = (
    authConfig: AuthConfig,
    userModel: UserModel,
    googleAuthClient: GoogleAuthClient
) =>
    validateGoogleLoginRequest(async (request, response) => {
        const { credential } = request.body;
        const googlePayload = await googleAuthClient.verifyCredential(
            credential
        );
        try {
            const { email, picture, name } = googlePayload;
            if (!email) {
                throw new BadRequestError('error missing email');
            }

            console.log(googlePayload);
            const unknownExistUser = await userModel.findOne({ email });
            const user = unknownExistUser
                ? unknownExistUser
                : await userModel.create({
                      email: email,
                      profileImage: picture
                          ? `/user/proxy-google-picture?url=${picture}`
                          : undefined,
                      password: 'google-login',
                      username: name ?? email
                  });
            const userId = user._id.toString();
            const tokens = await generateTokens(authConfig, userId);
            if (!tokens) {
                throw new InternalServerError('unable to create tokens');
            }

            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();

            responseSendTokensAndUserId(response, userId, tokens);
        } catch (error) {
            throw error instanceof ServerRequestError
                ? error
                : new BadRequestError(
                      'error missing email or password',
                      error as Error
                  );
        }
    });
