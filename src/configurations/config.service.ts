import { Injectable } from '@nestjs/common';
import * as config from 'config';

@Injectable()
export class ConfigService {
  get<T>(configurationKey: string): T {
    return config.get(configurationKey) as T;
  }
}
