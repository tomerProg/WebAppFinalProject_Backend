import { postModel } from '../../posts/model';
import { userModel } from '../../users/model';
import { Service } from '../service';
import { DatabaseConfig } from './config';

export class Database extends Service {
    constructor(private readonly config: DatabaseConfig) {
        super();
    }
    
    getModels = () => ({
        userModel: userModel,
        postModel: postModel
    });

    start() {}

    stop() {}
}
