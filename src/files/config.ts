import { ServerConfig } from '../services/server/config';
import { removeEndingSlash, removeStartingSlash } from '../utils/utils';

export type FileRouterConfig = {
    domain: string;
    profileImagesDestination: string;
    postImagesDestination: string;
};

export const createFileRouterConfig = (
    serverConfig: ServerConfig
): FileRouterConfig => {
    const { domain, postImagesDestination, profileImagesDestination } =
        serverConfig;

    return {
        domain: removeEndingSlash(domain),
        profileImagesDestination: removeStartingSlash(profileImagesDestination),
        postImagesDestination: removeStartingSlash(postImagesDestination)
    };
};
