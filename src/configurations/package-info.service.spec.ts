import { Test, TestingModule } from '@nestjs/testing';
import { PackageInfoService } from './package-info.service';

describe('PackageInfoService', () => {
  let service: PackageInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageInfoService],
    }).compile();

    service = module.get<PackageInfoService>(PackageInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
