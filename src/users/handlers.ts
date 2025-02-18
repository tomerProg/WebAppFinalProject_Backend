import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { validateAuthenticatedRequest } from '../authentication/validators';
import { InternalServerError, NotFoundError } from '../services/server/exceptions';
import { UserModel } from './model';
import {
    validateEditUserRequest,
    validateGetUserRequest,
    validateProxyGooglePictureRequest
} from './validators';

export const editUser = (userModel: UserModel) =>
    validateEditUserRequest(async (request, response) => {
        const { id: userId } = request.user;
        const { username, profileImage } = request.body;
        const { modifiedCount } = await userModel.updateOne(
            { _id: userId },
            { username, profileImage }
        );

        if (!modifiedCount || modifiedCount === 0) {
            throw new NotFoundError('could not find user');
        }
        response.sendStatus(StatusCodes.OK);
    });

export const getUserById = (userModel: UserModel) =>
    validateGetUserRequest(async (request, response) => {
        const { id: userId } = request.params;
        const user = await userModel.findById(userId, { password: 0 }).lean();
        if (!user) {
            throw new NotFoundError('user not found');
        }
        response.json(user);
    });

export const getLoggedUser = (userModel: UserModel) =>
    validateAuthenticatedRequest(async (request, response) => {
        const { id: userId } = request.user;
        const user = await userModel.findById(userId, { password: 0 }).lean();
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
            throw new InternalServerError('Error fetching image from google')
        }
    }
);
