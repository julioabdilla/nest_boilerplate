import * as moment from 'moment';
import { Request as BaseExpressRequest } from "express";

import { Instance, BaseModel as Model, DataTypes } from 'src/libs/db';
import HttpMethod from 'src/types/http_method';
import { User } from "src/models/user";
import { Request as RequestModel } from 'src/models/request';

export class Request extends Model {

  declare id: number;
  declare userId: string;
  declare requestId: string;
  declare method: HttpMethod;
  declare endpoint: string;
  declare headers: string;
  declare body: string;
  declare requestTime: string;
}

Request.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
    },
    requestId: {
      type: DataTypes.STRING,
    },
    method: {
      type: DataTypes.STRING,
    },
    endpoint: {
      type: DataTypes.STRING,
    },
    headers: {
      type: DataTypes.TEXT,
    },
    body: {
      type: DataTypes.TEXT,
    },
    requestTime: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'requests',
    sequelize: Instance,
    timestamps: true,
    paranoid: true,
    underscored: true
  },
);

export interface ExpressRequest extends BaseExpressRequest {

  user?: User;
  requestModel?: RequestModel;
  reqId?: string;
  requestTime?: moment.Moment;
  method: HttpMethod;
}