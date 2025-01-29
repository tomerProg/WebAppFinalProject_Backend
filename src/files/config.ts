import { ServerConfig } from '../services/server/config';

export type FileRouterConfig = {
    serverUrl: string;
    profileImagesDestination: string;
    postImagesDestination: string;
};

export const createFileRouterConfig = (
    serverConfig: ServerConfig,
    httpProtocol: 'http' | 'https'
): FileRouterConfig => ({
    serverUrl: `${httpProtocol}://${serverConfig.domain}:${serverConfig.port}/`,
    profileImagesDestination: serverConfig.profileImagesDestination,
    postImagesDestination: ''
});
