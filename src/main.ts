import { Logger, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { major } from 'semver';
import { AppModule } from './app.module';
import { HOSTNAME, PORT } from './common/constants/configurations.constants';
import { FallbackFilter } from './common/filters/fallback.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HttpLoggerInterceptor } from './common/interceptors/http-logger.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ConfigService } from './configurations/config.service';
import { PackageInfoService } from './configurations/package-info.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  //enable API versioning using URI
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const packageInfoService = app.get<PackageInfoService>(PackageInfoService);
  const logger = new Logger('BootStrap');

  const packageVersion = packageInfoService.getVersion();
  const packageName = packageInfoService.getName();
  const packageDescription = packageInfoService.getDescription();

  const port = configService.get<string>(PORT);
  const hostname = configService.get<string>(HOSTNAME);

  // Environment Validation
  logger.log(`Validating server environment`);

  // If no environment is defined, sets environment to "local"
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'local';
    logger.warn(`Warning : Starting the application in "${process.env.NODE_ENV}" mode for debugging purposes.`);
  }

  // Creates swagger documentation only if the application runs in any environment different than production
  if (process.env.NODE_ENV !== 'production') {
    const swaggerOptions = new DocumentBuilder()
      .setTitle(packageName)
      .setDescription(packageDescription)
      .setVersion(packageVersion)
      .setLicense('MIT', 'https://mit-license.org')
      .addServer(`http://${hostname}:${port}`, `Local server in mode`)
      .addTag(`${packageName}`)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    const swaggerPath = `/v${major(packageVersion)}/${packageName}/documentation/api`;
    SwaggerModule.setup(swaggerPath, app, document);
    logger.debug(`Serving "${packageName}" Open API documentation at: http://${hostname}:${port}${swaggerPath}`);
  }

  //Binding global interceptors to the application
  app.useGlobalInterceptors(new HttpLoggerInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  //Binding global filters to the application
  //Note: the filters should be ordered from the most generic to the most specific
  app.useGlobalFilters(new FallbackFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Binding global middlewares
  app.use(helmet());

  // Starts listening for shutdown hooks (for graceful shutdowns)
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`${packageName} v${packageVersion} is listening at http://${hostname}:${port} in "${process.env.NODE_ENV}" mode`);
}
bootstrap();
