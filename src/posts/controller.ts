import { StatusCodes } from 'http-status-codes';
import { PostModel } from './model';
import { validateCreatePostRequest, validateDeletePostRequest, validateEditPostRequest, validateGetPostByIdRequest, validateGetPostRequest } from './validators';
import { BadRequestError, UnauthorizedError } from '../services/server/exceptions';
import { buildPostFilter } from './utils';

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
    validateCreatePostRequest(async (request, response) => {
        const { id: user } = request.user;
        const {title, description, suggestion, imageSrc} = request.body; 
        const createdPost = await postModel.create({
            ...request.body,
            owner: user
        });

        if (!createdPost) {
            throw new BadRequestError('could not create post');
        }
        response.sendStatus(StatusCodes.OK).send(createdPost);
        //response.sendStatus(StatusCodes.OK)       
    });

export const deletePost = (postModel: PostModel) =>
    validateDeletePostRequest(async (request, response) => {
        const { _id: postId } = request.body;
        const originalPost = await postModel.findById(postId).lean();
        if (!originalPost){
            throw new BadRequestError('post does not exist');
        }
        
        const { id: user } = request.user;
        if (user != originalPost.owner){
            throw new UnauthorizedError('invalid user');
        }
        
        await postModel.findByIdAndDelete(postId);
        response.sendStatus(StatusCodes.OK);
    });

export const getAllPosts = (postModel: PostModel) =>
    validateGetPostRequest(async (request, response) => {
        const filter = request.body;
        const posts = await postModel.find(filter ? buildPostFilter(filter) : {})
        response.send(posts);
    });

export const getPostById = (postModel: PostModel) =>
    validateGetPostByIdRequest(async (request, response) => {
        const id = request.params.id;
        
        const post = await postModel.findById(id).lean();
        response.send(post);
    });
    
