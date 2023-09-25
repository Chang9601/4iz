import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { PaginationDto } from '../src/dtos/pagination.dto';

describe('Item E2E Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('getItem', () => {
    it('should get a single item', async () => {
      const id = 22;

      const response = await request(app.getHttpServer())
        .get(`/items/${id}`)
        .expect(HttpStatus.OK);

      const body = response.body;

      expect(body.id).toBeDefined();
      expect(body.name).toBeDefined();
    });

    it('should throw NotFoundException for an invalid id', async () => {
      const id = 10002;

      await request(app.getHttpServer())
        .get(`/items/${id}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('getItems', () => {
    it('should get an array of items meeting conditions', async () => {
      const paginationDto: PaginationDto = {
        offset: 0,
        limit: 20,
        search: '신발',
        gender: '여성',
        skip: 0,
      };

      const response = await request(app.getHttpServer())
        .get(`/items`)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      const body = response.body;
      const pageState = body.pageState;

      expect(pageState.total).toBeDefined();
      expect(pageState.currentPage).toBeDefined();
      expect(pageState.lastPage).toBeDefined();
    });
  });

  afterEach(async () => await app.close());
});
