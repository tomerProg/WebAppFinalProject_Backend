import { commentModel } from '../../comments/model';
import { postModel } from '../../posts/model';
import { userModel } from '../../users/model';
import { Service } from '../service';
import { DatabaseConfig } from './config';
import mongoose, { Connection } from 'mongoose';

export class Database extends Service {
    private databaseConnection: Connection;

    constructor(private readonly config: DatabaseConfig) {
        super();
        this.databaseConnection = mongoose.connection;
        this.databaseConnection.on('error', (error) => console.error(error));
        this.databaseConnection.once('open', () => console.log('Connected to database'));
    }
    
    getModels = () => ({
        userModel: userModel,
        postModel: postModel,
        commentModel: commentModel
    });

    async start() {
        await mongoose.connect(this.config.connection);
    }

    async stop() {
        await mongoose.disconnect();
    }
}