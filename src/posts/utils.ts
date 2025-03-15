import { UpdateQuery } from 'mongoose';
import { isNil } from 'ramda';
import { Post } from './model';

export const createPostLikeUpdate = (
    userId: string,
    like?: boolean
): UpdateQuery<Post> =>
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
