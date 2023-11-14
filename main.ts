import * as moment from 'moment';
import { NestFactory } from '@nestjs/core';

import env from 'env';
import { Instance } from 'src/libs/db';
import { Logger } from 'src/libs/logger';
import { HttpExceptionFilter } from 'src/exceptions/http_exception';
import ResponseInterceptor from 'src/interceptors/response_interceptor';
import { AppModule } from 'src/app.module';
import { AppModule as SchedulerAppModule } from 'src/scheduler.module';

async function bootstrap() {
  let mode = env.APP_MODE || 'api';
  Logger.info(`Running apps on ${mode} mode`);
  let app: any;
  try {
    const now = moment();
    const waitConnection = () => {
      return new Promise<any>(async (resolve, reject) => {
        try {
          await Promise.all([Instance.authenticate()])
          resolve(null);
        } catch (e) {
          const diff = moment.duration(now.diff(moment())).asMinutes();
          if (Math.abs(diff) < 0.5) {
            waitConnection().then(resolve).catch(reject);
          } else {
            reject(e);
          }
        }
      })
    }
    await waitConnection();
    if (mode === 'scheduler') {
      app = await NestFactory.createApplicationContext(SchedulerAppModule);
    } else {
      app = await NestFactory.create(AppModule);

      app.setGlobalPrefix('v1.0');
      app.useGlobalInterceptors(new ResponseInterceptor());
      app.useGlobalFilters(new HttpExceptionFilter);

      await app.listen(env.APP_PORT || 3000);
    }
  } catch (e) {
    Logger.error(e);
    if (app) {
      app.close();
    }
  }
}
bootstrap();
