import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Redis } from 'ioredis';

import { isItem } from '../../common/factories/type-guard.factory';
import {
  deserializeItem,
  serializeItem,
} from '../../common/factories/common.factory';

@Injectable()
export class CustomCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache, // private readonly configService: ConfigService,
  ) {}

  private get redisClient(): Redis {
    // @ts-expect-error: getClient() 메서드를 추가한다.
    return this.cache.store.getClient();
  }

  async hSet(key: string, value: object) {
    if (isItem(value)) {
      const serializedItem = serializeItem(value);

      return await this.redisClient.hset(key, serializedItem);
    }

    throw new InternalServerErrorException('HSET 연산 중 오류 발생.');
  }

  async hGet(key: string, field: string) {
    const value = await this.redisClient.hget(key, field);

    // HGET()메서드는 키에 해당하는 값이 없으면 null를 반환한다.
    return value ? value : null;
  }

  async hGetAll(key: string) {
    const value = await this.redisClient.hgetall(key);

    if (isItem(value)) {
      const deserializedItem = deserializeItem(value);

      return deserializedItem;
    }

    // HGETALL()메서드는 키에 해당하는 값이 없으면 빈 객체({})를 반환한다.
    return {};
  }
}
