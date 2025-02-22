import axios from 'axios';
import { ProjectionType } from 'mongoose';
import { validateAuthenticatedRequest } from '../authentication/validators';
import {
    InternalServerError,
    NotFoundError
} from '../services/server/exceptions';
import { User, UserModel } from './model';
import {
    validateEditUserRequest,
    validateGetUserRequest,
    validateProxyGooglePictureRequest
} from './validators';

const PRIVATE_USER_FIELDS: ProjectionType<User> = {
    password: 0,
    refreshToken: 0
};

export const editUser = (userModel: UserModel) =>
    validateEditUserRequest(async (request, response) => {
        const { id: userId } = request.user;
        const { username, profileImage } = request.body;
        const updatedUser = await userModel
            .findByIdAndUpdate(
                { _id: userId },
                { username, profileImage },
                { new: true, projection: PRIVATE_USER_FIELDS }
            )
            .lean();

        if (!updatedUser) {
            throw new NotFoundError('could not find user');
        }
        response.json(updatedUser);
    });

export const getUserById = (userModel: UserModel) =>
    validateGetUserRequest(async (request, response) => {
        const { id: userId } = request.params;
        const user = await userModel
            .findById(userId, PRIVATE_USER_FIELDS)
            .lean();
        if (!user) {
            throw new NotFoundError('user not found');
        }
        response.json(user);
    });

export const getLoggedUser = (userModel: UserModel) =>
    validateAuthenticatedRequest(async (request, response) => {
        const { id: userId } = request.user;
        const user = await userModel
            .findById(userId, PRIVATE_USER_FIELDS)
            .lean();
        if (!user) {
            throw new NotFoundError('user not found');
        }
        response.json(user);
    });

export const proxyGoogleImage = validateProxyGooglePictureRequest(
    async (request, response) => {
        const {
            query: { url: imageUrl }
        } = request;
        try {
            const goggleResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer'
            });
            response.setHeader(
                'Content-Type',
                goggleResponse.headers['content-type']
            );
            response.send(goggleResponse.data);
        } catch (error) {
            throw new InternalServerError('Error fetching image from google');
        }
    }
);
