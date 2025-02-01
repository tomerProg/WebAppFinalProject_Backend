import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError } from '../services/server/exceptions';
import { PostModel, PostWithId } from './model';
import { buildPostFilter } from './utils';
import {
    validateCreatePostRequest,
    validateDeletePostRequest,
    validateEditPostRequest,
    validateGetPostByIdRequest,
    validateGetPostRequest
} from './validators';
import { createChatGeneratorConfig } from '../openai/config';
import { ChatGenerator } from '../openai/openai';
import { environmentVariables } from '../config';

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


export const createPost = (postModel: PostModel, chatGenerator: ChatGenerator) =>
    validateCreatePostRequest(async (request, response) => {
        const { id: user } = request.user;
        const createdPost = await postModel.create({
            ...request.body,
            owner: user
        });

        if (!createdPost) {
            throw new BadRequestError('could not create post');
        }

        if (!createdPost.suggestion){
            createdPost.suggestion = await updateSuggestion(postModel, chatGenerator, createdPost)
        }
        response.status(StatusCodes.OK).send(createdPost);
    });

const updateSuggestion = async (postModel: PostModel, chatGenerator: ChatGenerator, post: PostWithId )
    : Promise<string | undefined> => {
    const suggestion =  await chatGenerator.getSuggestion(post.description);
    const { modifiedCount } = await postModel.updateOne(
                { _id: post._id, 
                  owner: post.owner, 
                  title: post.title, 
                  description: post.description, 
                  imageSrc:post.imageSrc},
                { suggestion }
            );
    return modifiedCount === 1 ? suggestion : undefined;
};

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
