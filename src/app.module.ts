import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationsModule } from './configurations/configurations.module';

@Module({
  imports: [ConfigurationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
