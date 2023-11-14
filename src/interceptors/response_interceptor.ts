import * as moment from 'moment';

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

import { ExpressRequest as Request } from 'src/models/request';
import { Response as ResponseModel, SuccessResponse } from 'src/models/response';

@Injectable()
export default class ResponseInterceptor implements NestInterceptor {
  constructor() { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    return next
      .handle()
      .pipe(
        tap((responseBody: SuccessResponse<any>) => {
          try {
            const req: Request = ctx.getRequest();
            const res = ctx.getResponse();
            const now = moment();

            if (req.requestModel) {
              const response = instanceToPlain(responseBody);
              const responseModel = new ResponseModel();
              responseModel.requestId = req.requestModel.id;
              responseModel.httpCode = responseBody.httpCode;
              responseModel.headers = JSON.stringify(res.getHeaders());
              responseModel.body = JSON.stringify(response);
              responseModel.responseTime = moment.duration(now.diff(req.requestTime, 'millisecond')).asMilliseconds();
              ResponseModel.create(responseModel.toJSON());
            }
          } catch (e) {
            console.error(e);
          }
        }),
      )
      .pipe(
        map((data: SuccessResponse<any>) => {
          const req: Request = ctx.getRequest();
          const res = ctx.getResponse();
          const response = instanceToPlain(data);
          console.log(`[${req.requestTime.format()}] Sending Response ${req.method} ${req.path}:${data.httpCode}, data=${JSON.stringify(response)}`);
          res.status(data.httpCode);
          return instanceToPlain(response)
        })
      );
  }
}
