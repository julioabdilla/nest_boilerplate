
import { Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { RedisClient, RedisKeys } from 'src/libs/redis';
import { UnauthorizedException } from 'src/exceptions/response_exception';
import { ExpressRequest as Request } from 'src/models/request';
import { User as UserModel } from 'src/models/user';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AccessTokenValidatorMiddleware implements NestMiddleware {

  private static ACCESS_TOKEN_KEY = RedisKeys.AUTH_ACCESS_TOKEN;

  constructor(private readonly authService: AuthService) { };

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = parseInt(req.headers['client-id'] as string);
    const user: UserModel = await UserModel.findOne({ where: { id: userId } });
    const token = await RedisClient.get(`${AccessTokenValidatorMiddleware.ACCESS_TOKEN_KEY}:${user.key}`);
    if (!token) {
      throw new UnauthorizedException();
    }
    if (token !== req.headers['authorization'] as string) {
      throw new UnauthorizedException();
    }
    this.authService.setExpireToken(req.user.key);
    next();
  }
}
