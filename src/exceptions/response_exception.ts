import { HttpStatus as HttpStatusCode, HttpException } from "@nestjs/common";

import BaseResponse from "src/dto/base_response";

export class BaseHttpException<T> extends HttpException {
  public responseModel: BaseResponse<T>;

  constructor(httpCode: HttpStatusCode, respnseCode: string, success: boolean, message?: string, data?: T) {
    super(message, httpCode);
    this.responseModel = new BaseResponse(httpCode, respnseCode, success, message, data);
  }
}

export class BadRequestException extends BaseHttpException<void> {
  constructor(message?: string) {
    super(HttpStatusCode.BAD_REQUEST, '01', false, `Bad Requests.${message ? ' ' + message : ''}`);
  }
}

export class UnauthorizedException extends BaseHttpException<void> {
  constructor(message?: string) {
    super(HttpStatusCode.UNAUTHORIZED, '02', false, `Unauthorized.${message ? ' ' + message : ''}`);
  }
}

export class ForbiddenException extends BaseHttpException<void> {
  constructor() {
    super(HttpStatusCode.FORBIDDEN, '03', false, 'Forbidden.');
  }
}

export class NotFoundException extends BaseHttpException<void> {
  constructor() {
    super(HttpStatusCode.NOT_FOUND, '04', false, 'Source Not Found.');
  }
}

export class GeneralErrorException extends BaseHttpException<void> {
  constructor() {
    super(HttpStatusCode.INTERNAL_SERVER_ERROR, '99', false, 'General Error.');
  }
}
