import { GoogleAuthClient } from '../../googleAuth/google.auth';
import { Database } from '../database/database';

export type ServerDependencies = {
    database: Database;
    googleAuthClient: GoogleAuthClient;
};
  