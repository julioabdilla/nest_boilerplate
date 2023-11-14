import { instanceToPlain } from 'class-transformer';
import * as moment from 'moment';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

import { BaseHttpException } from './response_exception';
import { ExpressRequest as Request } from 'src/models/request';
import { Response as ResponseModel } from 'src/models/response';

@Catch(BaseHttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: BaseHttpException<any>, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const responseData = exception.responseModel;
    const status = responseData.httpCode;
    const response = instanceToPlain(responseData);
    
    try {
      const now = moment();
      const responseModel = new ResponseModel();
      responseModel.requestId = req.requestModel.id;
      responseModel.httpCode = status;
      responseModel.headers = JSON.stringify(res.getHeaders());
      responseModel.body = JSON.stringify(response);
      responseModel.responseTime = moment.duration(now.diff(req.requestTime, 'millisecond')).asMilliseconds();
      ResponseModel.create(responseModel.toJSON());
    } catch (e) { 
      console.error(e);
    }
    console.log(`[${req.requestTime.format()}] Sending Response ${req.method} ${req.path}:${status}, data=${JSON.stringify(response)}`);
    res
      .status(status)
      .json(response);
  }
}
