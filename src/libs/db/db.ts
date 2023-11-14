import * as moment from 'moment';
import { Sequelize, Dialect, Model } from 'sequelize';

import env from 'env';

const Instance = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
  dialect: <Dialect>env.DB_DIALECT,
  replication: {
    read: [
      {
        host: env.DB_HOST_READ,
        port: env.DB_PORT_READ,
      },
    ],
    write: {
      host: env.DB_HOST_WRITE,
      port: env.DB_PORT_WRITE,
    },
  },
  pool: {
    max: 20,
    idle: 30000,
  },
  timezone: '+07:00',
  logging: (msg) => {
    console.log(`[${moment().format()}]`, env.DB_NAME, msg);
  },
});

class BaseModel extends Model {

  protected excludeMerge = [];

  public static async getTransaction() {
    return await this.sequelize?.transaction();
  }

  public apply(model: Model) {
    const keys = Object.keys(model).filter(key => !this.excludeMerge.includes(key));
    keys.map(key => {
      if (model[key]) {
        this[key] = model[key];
      }
    });
  }
}

export { Instance, BaseModel };