import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../services/server/exceptions';
import { UserModel } from './model';
import { validateEditUserRequest, validateGetUserRequest } from './validators';

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
