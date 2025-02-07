import { ServerConfig } from '../services/server/config';
import { removeEndingSlash, removeStartingSlash } from '../utils/utils';

export type FileRouterConfig = {
    serverUrl: string;
    profileImagesDestination: string;
    postImagesDestination: string;
};

export const createFileRouterConfig = (
    serverConfig: ServerConfig,
    httpProtocol: 'http' | 'https'
): FileRouterConfig => {
    const { domain, port, postImagesDestination, profileImagesDestination } =
        serverConfig;

    return {
        serverUrl: `${httpProtocol}://${removeEndingSlash(domain)}:${port}/`,
        profileImagesDestination: removeStartingSlash(profileImagesDestination),
        postImagesDestination: removeStartingSlash(postImagesDestination)
    };
};
