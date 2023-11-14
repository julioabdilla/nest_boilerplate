import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Logger } from 'src/libs/logger';

@Injectable()
export class TestScheduler {

  constructor() {
    Logger.info(`Registering ${this.constructor.name}`);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkTransactionStatus() {
    Logger.info(`test`);
  }
}
