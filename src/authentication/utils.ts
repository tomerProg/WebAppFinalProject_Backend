import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthConfig } from './config';
import { userModel } from '../users/model';
import { TokenPayload, Tokens } from './types';
import { BadRequestError } from '../services/server/exceptions';

const saltRounds = 10;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
};

export const generateTokens = (
    authConfig: AuthConfig,
    userId: string
): Tokens | null => {
    const random = Math.random().toString();
    const payload: TokenPayload = {
        _id: userId,
        random: random
    };
    const { tokenSecret, tokenExpires, refreshTokenExpires } = authConfig;

    const accessToken = jwt.sign(payload, tokenSecret, {
        expiresIn: tokenExpires
    });
    const refreshToken = jwt.sign(payload, tokenSecret, {
        expiresIn: refreshTokenExpires
    });

    return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (
    tokenSecret: string,
    refreshToken: string | undefined
) => {
    if (!refreshToken) {
        throw new BadRequestError('missing refresh token');
    }
    const verifiedTokenPayload = jwt.verify(refreshToken, tokenSecret);
    if (typeof verifiedTokenPayload === 'string') {
        throw new BadRequestError('token payload shoud not be string');
    }

    const userId = verifiedTokenPayload._id;
    const user = await userModel.findById(userId);
    if (!user) {
        throw new BadRequestError('user not found');
    }
    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
        user.refreshToken = [];
        await user.save();
        throw new BadRequestError('invalid refresh token');
    }
    const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
    user.refreshToken = tokens;

    return user;
};
