import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ItemsModule } from './../src/items/items.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemRepository } from '../src/items/items.repository';

describe('ItemsController (e2e)', () => {
  let app: INestApplication;

  const mockItemsRepository = {
    getItems: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ItemsModule],
    })
      .overrideProvider(getRepositoryToken(ItemRepository))
      .useValue(mockItemsRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/items (GET)', () => {
    return request(app.getHttpServer()).get('/items').expect(200);
  });
});
