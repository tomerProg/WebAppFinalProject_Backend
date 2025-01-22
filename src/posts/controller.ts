import { StatusCodes } from 'http-status-codes';
import { PostModel } from './model';
import { validateEditPostRequest } from './validators';
import { BadRequestError } from '../services/server/exceptions';

export const editPost = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const { id: postId } = request.user;
        const { title, description, suggestion, imageSrc } = request.body;
        const { modifiedCount } = await postModel.updateOne(
            { _id: postId },
            { title, description, suggestion, imageSrc }
        );

        if (!modifiedCount || modifiedCount === 0) {
            throw new BadRequestError('could not edit post');
        }
        response.sendStatus(StatusCodes.OK);
    });
