import swaggerJsDoc from 'swagger-jsdoc';
import { ServerConfig } from './services/server/config';

const options = (serverConfig: ServerConfig) => ({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fixers API',
            version: '1.0.0',
            description:
                'Api doc for Fixers, final project of Tomer Shomron & Omer Hasid'
        },
        servers: [
            { url: 'http://localhost:3000' },
            { url: serverConfig.domain }
        ]
    },
    apis: ['./src/*.ts', './src/**/*.ts']
});

export const createSwaggerSpecs = (serverConfig: ServerConfig) =>
    swaggerJsDoc(options);
