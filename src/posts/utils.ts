import { RootFilterQuery } from 'mongoose';
import { PostModel } from './model';
import { isNil } from 'ramda';

export interface PostFilter {
    title?: string;
    owner?: string;
    description?: string;
}

export const buildPostFilter = (
    filterValue: PostFilter
): RootFilterQuery<PostFilter> => {
    let filter: RootFilterQuery<PostFilter> = {};
    if (filterValue.title) {
        filter = Object.assign(filter, {
            title: { $regex: filterValue.title, $options: 'i' }
        });
    }
    if (filterValue.owner) {
        filter = Object.assign(filter, { owner: filterValue.owner });
    }
    if (filterValue.description) {
        filter = Object.assign(filter, {
            description: { $regex: filterValue.description, $options: 'i' }
        });
    }
    return filter;
};

export const createPostLikeUpdate = (
    userId: string,
    like?: boolean
): Parameters<PostModel['updateOne']>[1] =>
    isNil(like)
        ? {
              $pull: { likes: userId, dislikes: userId }
          }
        : like
        ? {
              $pull: { dislikes: userId },
              $addToSet: { likes: userId }
          }
        : {
              $pull: { likes: userId },
              $addToSet: { dislikes: userId }
          };
