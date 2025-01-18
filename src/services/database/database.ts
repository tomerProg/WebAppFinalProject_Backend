import { userModel } from '../../users/model';
import { Service } from '../service';

export class Database extends Service {
    getModels = () => {
        userModel;
    };

    start() {}

    stop() {}
}
