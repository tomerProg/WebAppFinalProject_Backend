import { ChatGenerator } from '../openai/openai';
import { PostModel } from './model';

export type PostsRouterDependencies = {
    postModel: PostModel;
    chatGenerator: ChatGenerator
};
