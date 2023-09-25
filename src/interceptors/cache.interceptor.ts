import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

import { createCachekey } from '../common/factories/common.factory';

// import { Redis } from 'ioredis';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  // getClient() 메서드를 추가한다.
  // private get redisClient(): Redis {
  //   return this.cacheManager.store.getClient();
  // }

  trackBy(context: ExecutionContext): string | undefined {
    // @CacheKey() 데코레이터로 맞춤 캐시 키를 추출한다.
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // 사용자 정의 캐시 키
    if (cacheKey) {
      const request = context.switchToHttp().getRequest();
      const id = request.params.id;

      return createCachekey(cacheKey, id);
    }

    return super.trackBy(context);
  }

  // set(), get()와 같은 기본 메서드 외에 Redis의 모든 메서드를 사용할 수 있다.
  // async intercept(
  //   context: ExecutionContext,
  //   next: CallHandler<any>,
  // ): Promise<Observable<any>> {
  //   const customTtl = this.reflector.get(
  //     CACHE_TTL_METADATA,
  //     context.getHandler(),
  //   );

  //   const key = this.trackBy(context) as string;

  //   return next.handle().pipe(
  //     map(async (data: any) => {
  //       const keyExists = await this.redisClient.exists(key);

  //       if (keyExists) {
  //         const obj = JSON.parse((await this.redisClient.get(key)) as string);
  //         const deserializedItem = deserializeItem(obj);

  //         return deserializedItem;
  //       }

  //       if (isItem(data)) {
  //         const serializedItem = serializeItem(data);

  //         return this.cacheManager.set(key, serializedItem);
  //       }
  //     }),
  //   );
  // }
}
