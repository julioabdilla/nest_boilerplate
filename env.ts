import * as dotenv from 'dotenv';
import Environment from 'src/types/project_env';

dotenv.config({ path: '.env' });

const env = process.env;
env['NODE_ENV'] = env.NODE_ENV ? <Environment> env.NODE_ENV : Environment.PRODUCTION;

export default env;