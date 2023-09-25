import { Module } from '@nestjs/common';

import { TypeOrmConfigService } from './typeorm-config.service';
import { CacheConfigService } from './cache-config.service';

@Module({
  providers: [TypeOrmConfigService, CacheConfigService],
  exports: [TypeOrmConfigService, CacheConfigService],
})
export class CustomConfigModule {}
