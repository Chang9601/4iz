import { Module } from '@nestjs/common';

import { CustomCacheService } from './custom-cache.service';

@Module({
  providers: [CustomCacheService],
  exports: [CustomCacheService],
})
export class CustomCacheModule {}
