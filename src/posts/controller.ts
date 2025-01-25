import { StatusCodes } from 'http-status-codes';
import { PostModel } from './model';
import { validateEditPostRequest } from './validators';
import { BadRequestError, UnauthorizedError } from '../services/server/exceptions';

export const editPost = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const { _id: postId, title, description, suggestion, imageSrc } = request.body;
        const originalPost = await postModel.findById(postId).lean();
        if (!originalPost){
            throw new BadRequestError('post does not exist');
        }

        const { id: user } = request.user;
        if (user != originalPost.owner){
            throw new UnauthorizedError('invalid user');
        }
        
        const { modifiedCount } = await postModel.updateOne(
            { _id: postId, owner: user },
            { title, description, suggestion, imageSrc }
        );

        if (!modifiedCount || modifiedCount === 0) {
            throw new BadRequestError('could not edit post');
        }
        response.sendStatus(StatusCodes.OK);
    });

export const createPost = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const createdPost = await postModel.create(request.body);

        if (!createdPost) {
            throw new BadRequestError('could not create post');
        }
        response.sendStatus(StatusCodes.OK).send(createdPost);
    });

export const deletePost = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const { id } = request.user;
        await postModel.findByIdAndDelete(id);
        response.sendStatus(StatusCodes.OK);
    });

export const getAllPosts = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const posts = await postModel.find();
        response.sendStatus(StatusCodes.OK).send(posts);
    });
