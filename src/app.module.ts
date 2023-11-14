import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { AccessTokenValidatorMiddleware } from 'src/middlewares/access_token_validator';
import { OnRequestMiddleware } from 'src/middlewares/on_request';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OnRequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(AccessTokenValidatorMiddleware)
      .exclude('auth', 'tools/signature/keys', 'tools/signature/verify', 'tools/signature/generate', 'tools/json/stringify', 'tools/json/encode')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
