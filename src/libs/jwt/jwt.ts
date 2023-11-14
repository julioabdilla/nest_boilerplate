import * as jwt from 'jwt-simple';

export class Jwt {

  public static ENCODE(payload: any, secret: string): string {
    return jwt.encode(payload, secret);
  }

  public static DECODDE(token: string, secret: string): any {
    return jwt.decode(token, secret);
  }
}
