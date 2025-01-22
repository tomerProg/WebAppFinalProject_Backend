import { OAuth2Client } from 'google-auth-library';
import {
    BadRequestError,
    InternalServerError
} from '../services/server/exceptions';

export class GoogleAuthClient {
    private readonly client: OAuth2Client;
    constructor(googleClientId: string) {
        this.client = new OAuth2Client({ clientId: googleClientId });
    }

    verifyCredential = async (credential: string) => {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: credential
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new InternalServerError('empty payload');
            }
            
            return payload;
        } catch (err) {
            throw new BadRequestError(
                'error missing email or password',
                err as Error
            );
        }
    };
}
