import { Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { TestScheduler } from './schedulers/test.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TestScheduler],
})
export class AppModule implements NestModule {
  configure() { };
}
