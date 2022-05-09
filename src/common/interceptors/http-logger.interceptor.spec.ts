import { HttpLoggerInterceptor } from './http-logger.interceptor';

describe('HttpLoggerInterceptor', () => {
  it('should be defined', () => {
    expect(new HttpLoggerInterceptor()).toBeDefined();
  });
});
