import { v4 as uuid } from 'uuid';
import * as moment from 'moment';

import { Injectable } from '@nestjs/common';

import env from 'env';
import { RedisClient, RedisExpiryType, RedisKeys } from 'src/libs/redis/redis_client';
import { Jwt } from 'src/libs/jwt/jwt';
import { User as UserModel } from 'src/models/user';
import GrantType from 'src/types/grant_type';
import { UnauthorizedException } from 'src/exceptions/response_exception';

@Injectable()
export class AuthService {

  private static ACCESS_TOKEN_KEY = RedisKeys.AUTH_ACCESS_TOKEN;
  private static REFRESH_TOKEN_KEY = RedisKeys.AUTH_REFRESH_TOKEN;
  private static SESSION_ID_KEY = RedisKeys.AUTH_SESSION_ID;
  private static ACCESS_TOKEN_EXPIRY = 900; // 15 minutes
  private static REFRESH_TOKEN_EXPIRY = 3.156e+7; // 1 year
  private static AUTH_SECRET = env.JWT_SECRET;

  public async checkCredential(username: string, password: string): Promise<Boolean> {
    const user = await UserModel.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.password === password;
  }

  public async login(username: string, sessionId?: string): Promise<{ accessToken: string, refreshToken: string, accessTokenExpiry: string, refreshTokenExpiredAt: string }> {
    if (!sessionId) {
      sessionId = uuid();
    }
    const { accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiredAt } = this.signToken(username, sessionId);
    await RedisClient.del(`${AuthService.ACCESS_TOKEN_KEY}:${username}`);
    await RedisClient.set(`${AuthService.ACCESS_TOKEN_KEY}:${username}`, accessToken);
    await RedisClient.set(`${AuthService.SESSION_ID_KEY}:${sessionId}`, JSON.stringify({ accessToken, refreshToken }));
    await RedisClient.set(`${AuthService.REFRESH_TOKEN_KEY}:${refreshToken}`, JSON.stringify({ grant_type: GrantType.REFRESH_TOKEN, username, sessionId }));
    this.setExpireToken(username, refreshToken, sessionId);
    return {
      accessToken, accessTokenExpiry: `${accessTokenExpiry}s`, refreshToken, refreshTokenExpiredAt
    };
  }

  public async setExpireToken(username: string, refreshToken?: string, sessionId?: string) {
    RedisClient.expire(`${AuthService.ACCESS_TOKEN_KEY}:${username}`, { type: RedisExpiryType.SECONDS, value: AuthService.ACCESS_TOKEN_EXPIRY });
    if (refreshToken) {
      RedisClient.expire(`${AuthService.REFRESH_TOKEN_KEY}:${refreshToken}`, { type: RedisExpiryType.SECONDS, value: AuthService.REFRESH_TOKEN_EXPIRY });
      if (sessionId) {
        RedisClient.expire(`${AuthService.SESSION_ID_KEY}:${sessionId}`, { type: RedisExpiryType.SECONDS, value: AuthService.REFRESH_TOKEN_EXPIRY });
      }
    }
  }

  private signToken(username: string, sessionId: string): { accessToken: string, refreshToken: string, accessTokenExpiry: number, refreshTokenExpiredAt: string } {
    const now = moment();
    const accessTokenExpiredAt = now.add(AuthService.ACCESS_TOKEN_EXPIRY, 'seconds').format();
    const refreshTokenExpiredAt = now.add(AuthService.REFRESH_TOKEN_EXPIRY, 'second').format();
    const accessToken = Jwt.ENCODE({ grant_type: GrantType.CLIENT_CREDENTIALS, username, sessionId, accessTokenExpiredAt }, AuthService.AUTH_SECRET);
    const refreshToken = Jwt.ENCODE({ grant_type: GrantType.REFRESH_TOKEN, sessionId, refreshTokenExpiredAt }, AuthService.AUTH_SECRET);
    return { accessToken, refreshToken, accessTokenExpiry: AuthService.ACCESS_TOKEN_EXPIRY, refreshTokenExpiredAt };
  }

  public async refreshToken(username: string, refreshToken: string): Promise<{ accessToken: string, refreshToken: string, accessTokenExpiry: string, refreshTokenExpiredAt: string }> {
    const refreshTokenRedis = await RedisClient.get(`${AuthService.REFRESH_TOKEN_KEY}:${refreshToken}`);
    if (!refreshTokenRedis) {
      throw new UnauthorizedException();
    }
    const refreshTokenDecoded = await Jwt.DECODDE(refreshToken, AuthService.AUTH_SECRET);
    if (refreshTokenDecoded.sessionId != JSON.parse(refreshTokenRedis).sessionId) {
      throw new UnauthorizedException();
    }
    await RedisClient.del(`${AuthService.REFRESH_TOKEN_KEY}:${refreshToken}`);
    return this.login(username, refreshTokenDecoded.sessionId);
  }
}
