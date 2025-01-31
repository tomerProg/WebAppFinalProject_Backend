import { RootFilterQuery } from "mongoose";

export interface CommentFilter {
    owner?: string,
    postId?: string,
    content?: string
}

export const buildCommentFilter = (filterValue: CommentFilter): RootFilterQuery<CommentFilter> => {
    let filter: RootFilterQuery<CommentFilter> = {};
    if (filterValue.owner){
        filter = Object.assign(filter, {owner: filterValue.owner })
    }
    if (filterValue.postId){
        filter = Object.assign(filter, {postId: filterValue.postId })
    }
    if (filterValue.content){
        filter = Object.assign(filter, {content: { $regex: filterValue.content, $options: 'i' } })
    }
    return filter;
}