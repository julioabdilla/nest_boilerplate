import * as moment from 'moment';
import axios, { AxiosInstance, AxiosPromise, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders as BaseAxiosRequestHeaders } from 'axios';

import { Logger } from 'src/libs/logger';

declare module 'axios' {
  interface AxiosResponse<T = any> extends Promise<T> { }
}

type NonUndefined<T, E = undefined> = Pick<
  T,
  {
    [Prop in keyof T]: T[Prop] extends E ? never : Prop
  }[keyof T]
>
interface AxiosRequestHeaders extends BaseAxiosRequestHeaders { }
export type HttpHeaders = NonUndefined<AxiosRequestHeaders>;

export interface HttpRequestConfig extends InternalAxiosRequestConfig {
  urlParams?: any;
  storedData?: any;
  _retry?: boolean;
}

export interface HttpResponse extends AxiosResponse {
  config: HttpRequestConfig;
}

export interface HttpError extends AxiosError {
  config: HttpRequestConfig;
}

export interface HttpInstance extends AxiosInstance {
  (config: HttpRequestConfig): AxiosPromise;
}

export class HttpClient {
  protected readonly instance: HttpInstance;

  constructor(baseURL?: string, timeout?: number) {
    this.instance = axios.create({
      baseURL,
      timeout,
    });
    this._initializeRequestInterceptor();
    this._initializeResponseInterceptor();
  }

  protected setBaseUrl = (baseUrl: string) => {
    this.instance.defaults.baseURL = baseUrl;
  }

  public get = (endpoint: string, options?: HttpRequestConfig) => {
    let urlParams: object;
    if (options !== undefined) {
      urlParams = options.urlParams;
    }
    return this.instance.get<any | any[]>(this.parseEndpoint(endpoint, urlParams), options);
  }

  public post = (endpoint: string, body: any, options?: HttpRequestConfig) => {
    let urlParams: object;
    if (options !== undefined) {
      urlParams = options.urlParams;
    }
    return this.instance.post<any | any[]>(this.parseEndpoint(endpoint, urlParams), body, options);
  }

  public put = (endpoint: string, body: any, options?: HttpRequestConfig) => {
    let urlParams: object;
    if (options !== undefined) {
      urlParams = options.urlParams;
    }
    return this.instance.put<any | any[]>(this.parseEndpoint(endpoint, urlParams), body, options);
  }

  public patch = (endpoint: string, body, options?: HttpRequestConfig) => {
    let urlParams: object;
    if (options !== undefined) {
      urlParams = options.urlParams;
    }
    return this.instance.patch<any | any[]>(this.parseEndpoint(endpoint, urlParams), body, options);
  }

  public delete = (endpoint: string, options?: HttpRequestConfig) => {
    let urlParams: object;
    if (options !== undefined) {
      urlParams = options.urlParams;
    }
    return this.instance.delete<any | any[]>(this.parseEndpoint(endpoint, urlParams), options);
  }

  protected _handleRequest = (config: HttpRequestConfig) => {
    const headerLog = {};
    for (const key in config.headers) {
      if (!['common', 'head', 'get', 'post', 'patch', 'put', 'delete'].includes(key)) {
        headerLog[key] = config.headers[key];
      }
    }
    Logger.info(`Sending Request to ${config.method.toUpperCase()} ${config.url}, headers=${JSON.stringify(headerLog)}, body=${JSON.stringify(config.data)}`);
    return config;
  }

  protected _handleResponse = (response: HttpResponse) => {
    Logger.info(`Received Response from ${response.config.method.toUpperCase()} ${response.config.url}:${response.status}, data=${JSON.stringify(response.data)}`);
    return response.data;
  };

  protected _handleError = (error: HttpError) => {
    const config: HttpRequestConfig = error.config;
    if (error.response) {
      Logger.info(`Received Response from ${config.method.toUpperCase()} ${config.url}:${error.response.status}, data=${JSON.stringify(error.response.data)}`);
    }
    return Promise.reject(error);
  }

  protected _initializeRequestInterceptor = () => {
    this.instance.interceptors.request.use(
      this._handleRequest,
      this._handleError
    );
  }

  protected _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  }

  private parseEndpoint = (endpoint: string, params: object): string => {
    if (params !== undefined) {
      for (const key in params) {
        if (endpoint.includes(`:${key}`)) {
          endpoint = endpoint.replace(`:${key}`, params[key]);
        }
      }
    }
    return endpoint;
  }
}
