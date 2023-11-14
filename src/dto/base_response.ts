import { Exclude } from "class-transformer";

import { HttpStatus as HttpStatusCode } from "@nestjs/common";

export default class BaseResponse<T> {

  @Exclude()
  public httpCode: HttpStatusCode;

  public responseCode: string;
  public success: boolean;
  public message: string;
  public data: T;

  constructor(httpCode: HttpStatusCode, code: string, success: boolean, message?: string, data?: T) {
    this.httpCode = httpCode;
    this.success = success;
    this.responseCode = code;
    this.message = message;
    this.data = data;
  };
}
