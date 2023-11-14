import { HttpStatus as HttpStatusCode } from '@nestjs/common';

import { Instance, BaseModel as Model, DataTypes } from 'src/libs/db';
import BaseResponse from 'src/dto/base_response';

export class Response extends Model {

  declare id: number;
  declare requestId: number;
  declare httpCode: HttpStatusCode;
  declare headers: string;
  declare body: string;
  declare responseTime: number;
}

Response.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.BIGINT,
    },
    httpCode: {
      type: DataTypes.INTEGER,
    },
    headers: {
      type: DataTypes.TEXT,
    },
    body: {
      type: DataTypes.TEXT,
    },
    responseTime: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'responses',
    sequelize: Instance,
    timestamps: true,
    paranoid: true,
    underscored: true
  },
);


export class SuccessResponse<T> extends BaseResponse<T> {

  // Successful
  public static SUCCESS<T>(data?: T): SuccessResponse<T> {
    const httpCode = HttpStatusCode.OK;
    return new SuccessResponse(httpCode, '00', true, 'Successful.', data);
  }

  // Transaction still on
  // process
  public static PROCCESSED<T>(data?: T): SuccessResponse<T> {
    const httpCode = HttpStatusCode.ACCEPTED;
    return new SuccessResponse(httpCode, '00', true, 'Request In Progress.', data);
  }
}
