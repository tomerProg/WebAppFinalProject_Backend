import { StatusCodes } from 'http-status-codes';
import { UserModel } from './model';
import { validateEditUserRequest } from './validators';
import { BadRequestError } from '../services/server/exceptions';

export const editUser = (userModel: UserModel) =>
    validateEditUserRequest(async (request, response) => {
        const { id: userId } = request.user;
        const { nickname, profileImage } = request.body;
        const { modifiedCount } = await userModel.updateOne(
            { _id: userId },
            { nickname, profileImage }
        );

        if (!modifiedCount || modifiedCount === 0) {
            throw new BadRequestError('could not edit user');
        }
        response.sendStatus(StatusCodes.OK);
    });
