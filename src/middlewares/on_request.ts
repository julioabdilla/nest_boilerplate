import { Response, NextFunction } from 'express';
import * as moment from 'moment';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { uuidv4 as uuid } from 'uuid';

import { ExpressRequest as Request, Request as RequestModel } from 'src/models/request';
import HttpMethod from 'src/types/http_method';

@Injectable()
export class OnRequestMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      req.requestTime = moment();
      const { 'request-id': requestId } = req.headers;
      let reqId = requestId as string;
      if (!reqId) {
        reqId = uuid();
      }
      req.reqId = reqId;
      let newRequestModel = new RequestModel();
      newRequestModel.requestId = reqId;
      newRequestModel.method = <HttpMethod>req.method;
      newRequestModel.endpoint = req.path;
      newRequestModel.headers = JSON.stringify(req.headers);
      newRequestModel.body = JSON.stringify(req.body);
      newRequestModel.requestTime = req.requestTime.format();
      const requestResponse = {
        request: await RequestModel.create(newRequestModel.toJSON()),
      };
      req.requestModel = requestResponse.request;
      console.log(`[${req.requestTime.format()}] Incoming request ${req.method} ${req.path}, headers=${JSON.stringify(req.headers)}, body=${JSON.stringify(req.body)}`);
    } catch (e) {
      console.error(e);
    }
    next();
  }
}
