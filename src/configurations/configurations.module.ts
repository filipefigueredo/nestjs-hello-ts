import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PackageInfoService } from './package-info.service';

@Module({
  providers: [ConfigService, PackageInfoService],
  exports: [ConfigService, PackageInfoService],
})
export class ConfigurationsModule {}
