import { GoogleAuthClient } from '../googleAuth/google.auth';
import { UserModel } from '../users/model';

export type AuthRouterDependencies = {
    userModel: UserModel;
    googleAuthClient: GoogleAuthClient;
};
