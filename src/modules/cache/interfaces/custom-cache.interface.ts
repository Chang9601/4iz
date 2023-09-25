import { Cache, Store } from 'cache-manager';
import { Redis } from 'ioredis';

export interface CustomCache extends Cache {
  store: CustomStore;
}

export interface CustomStore extends Store {
  name: 'redis';
  getClient: () => Redis;
  isCacheableValue: (value: any) => boolean;
}
