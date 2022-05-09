import { Injectable } from '@nestjs/common';
require('pkginfo')(module, 'version', 'description', 'name'); // eslint-disable-line @typescript-eslint/no-var-requires
// import pkginfo from 'pkginfo'
// pkginfo(module, 'name', 'version', 'description')

@Injectable()
export class PackageInfoService {
  getVersion(): string {
    return module.exports?.version as string;
  }
  getName(): string {
    return module.exports?.name as string;
  }
  getDescription(): string {
    return module.exports?.description as string;
  }
}
