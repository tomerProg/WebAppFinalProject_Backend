import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError } from '../services/server/exceptions';
import { CommentModel } from './model';
import { buildCommentFilter } from './utils';
import {
    validateCreateCommentRequest,
    validateDeleteCommentRequest,
    validateEditCommentRequest,
    validateGetCommentByIdRequest,
    validateGetCommentRequest
} from './validators';

export const editComment = (commentModel: CommentModel) =>
    validateEditCommentRequest(async (request, response) => {
        const { id: commentId } = request.params;
        const { content } = request.body;
        const originalComment = await commentModel.findById(commentId).lean();
        if (!originalComment) {
            throw new BadRequestError('comment does not exist');
        }

        const { id: user } = request.user;
        if (user != originalComment.owner) {   
            throw new ForbiddenError('invalid user');
        }

        const { modifiedCount } = await commentModel.updateOne(
            { _id: commentId, owner: user },
            { content }
        );

        if (!modifiedCount || modifiedCount === 0) {
            throw new BadRequestError('could not edit comment');
        }
        response.sendStatus(StatusCodes.OK);
    });

export const createComment = (commentModel: CommentModel) =>
    validateCreateCommentRequest(async (request, response) => {
        const { id: user } = request.user;
        const createdComment = await commentModel.create({
            ...request.body,
            owner: user
        });

        if (!createdComment) {
            throw new BadRequestError('could not create comment');
        }
        response.status(StatusCodes.OK).send(createdComment);
    });

export const deleteComment = (commentModel: CommentModel) =>
    validateDeleteCommentRequest(async (request, response) => {
        const commentId = request.params.id;
        const originalComment = await commentModel.findById(commentId).lean();
        if (!originalComment) {
            throw new BadRequestError('comment does not exist');
        }

        const { id: user } = request.user;
        if (user != originalComment.owner) {
            throw new ForbiddenError('invalid user');
        }

        await commentModel.findByIdAndDelete(commentId);
        response.sendStatus(StatusCodes.OK);
    });

export const getAllComments = (commentModel: CommentModel) =>
    validateGetCommentRequest(async (request, response) => {
        const filter = request.body;
        const comments = await commentModel.find(
            filter ? buildCommentFilter(filter) : {}
        );
        response.send(comments);
    });

export const getCommentById = (commentModel: CommentModel) =>
    validateGetCommentByIdRequest(async (request, response) => {
        const id = request.params.id;

        const comment = await commentModel.findById(id).lean();
        response.send(comment);
    });
