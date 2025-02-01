import { StatusCodes } from 'http-status-codes';
import { isNil } from 'ramda';
import { BadRequestError, ForbiddenError, NotFoundError } from '../services/server/exceptions';
import { PostModel } from './model';
import { buildPostFilter, createPostLikeUpdate } from './utils';
import {
    validateCreatePostRequest,
    validateDeletePostRequest,
    validateEditPostRequest,
    validateGetPostByIdRequest,
    validateGetPostRequest,
    validateLikePostRequest
} from './validators';

export const editPost = (postModel: PostModel) =>
    validateEditPostRequest(async (request, response) => {
        const { id: postId } = request.params;
        const { title, description, suggestion, imageSrc } = request.body;
        const originalPost = await postModel.findById(postId).lean();
        if (!originalPost) {
            throw new BadRequestError('post does not exist');
        }

        const { id: user } = request.user;
        if (user != originalPost.owner) {
            throw new ForbiddenError('invalid user');
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
    validateCreatePostRequest(async (request, response) => {
        const { id: user } = request.user;
        const createdPost = await postModel.create({
            ...request.body,
            owner: user
        });

        if (!createdPost) {
            throw new BadRequestError('could not create post');
        }
        response.status(StatusCodes.OK).send(createdPost);
    });

export const deletePost = (postModel: PostModel) =>
    validateDeletePostRequest(async (request, response) => {
        const postId = request.params.id;
        const originalPost = await postModel.findById(postId).lean();
        if (!originalPost) {
            throw new BadRequestError('post does not exist');
        }

        const { id: user } = request.user;
        if (user != originalPost.owner) {
            throw new ForbiddenError('invalid user');
        }

        await postModel.findByIdAndDelete(postId);
        response.sendStatus(StatusCodes.OK);
    });

export const getAllPosts = (postModel: PostModel) =>
    validateGetPostRequest(async (request, response) => {
        const filter = request.body;
        const posts = await postModel.find(
            filter ? buildPostFilter(filter) : {}
        );
        response.send(posts);
    });

export const getPostById = (postModel: PostModel) =>
    validateGetPostByIdRequest(async (request, response) => {
        const id = request.params.id;

        const post = await postModel.findById(id).lean();
        response.send(post);
    });

export const setPostLike = (postModel: PostModel) =>
    validateLikePostRequest(async (request, response) => {
        const {
            user: { id: userId },
            params: { id: postId },
            body: { like }
        } = request;

        const update = createPostLikeUpdate(userId, like);
        const { modifiedCount } = await postModel.updateOne(
            { _id: postId },
            update
        );
        if (isNil(modifiedCount) || modifiedCount === 0) {
            throw new NotFoundError();
        }

        response.sendStatus(StatusCodes.OK);
    });
