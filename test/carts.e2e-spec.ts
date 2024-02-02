import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { CreateCartDto } from '../src/dtos/create-cart.dto';
import { PaginationDto } from '../src/dtos/pagination.dto';
import { User } from '../src/entities/user.entity';
import { Cart } from '../src/entities/cart.entity';
import { Role } from '../src/common/enums/common.enum';

describe('Cart E2E Test', () => {
  let app: INestApplication;

  const createUserDto: CreateUserDto = {
    name: '박선심',
    password: '1234Aa!@',
    email: 'sunshim@naver.com',
    phoneNumber: '010-1234-5678',
    birthday: new Date('1966-01-01'),
    role: Role.USER,
  };

  const credentials = {
    email: 'sunshim@naver.com',
    password: '1234Aa!@',
  };

  const createCartDto: CreateCartDto = {
    itemId: 5,
    options: ['검정색/220/2', '노란색/290/4', '멀티컬러/260/6'],
  };

  const paginationDto: PaginationDto = {
    offset: 0,
    limit: 10,
    skip: 0,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('createCart', () => {
    it('should create a cart', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      response = await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      const body = response.body;

      expect(body.totalQuantity).toBe(12);
    });

    it('should update an existing cart', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      const body = response.body;

      expect(body.totalQuantity).toBe(24);
    });
  });

  describe('getCarts', () => {
    it('should get an array of carts for a user meeting conditions', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .get('/carts')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      const body = response.body;
      const carts = body.carts;
      const pageState = body.pageState;

      expect(carts).toBeDefined();
      expect(pageState.total).toBe(3);
      expect(pageState.currentPage).toBe(1);
    });

    it('should throw NotFoundException for not having any carts', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .get('/carts')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('updateCart', () => {
    it('should update a cart', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .get('/carts')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      response = await request(app.getHttpServer())
        .patch(`/carts/${response.body.carts[0].id}`)
        .set('Cookie', cookies)
        .send({ quantity: 10 })
        .expect(HttpStatus.OK);

      const body = response.body;

      expect(body.totalQuantity).toBe(10);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .patch(`/carts/100000`)
        .set('Cookie', cookies)
        .send({ quantity: 10 })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('deleteCart', () => {
    it('should delete a cart', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .get('/carts')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      let body = response.body;
      let carts = body.carts;

      const prevLength = carts.length;

      await request(app.getHttpServer())
        .delete(`/carts/${response.body.carts[0].id}`)
        .set('Cookie', cookies)
        .expect(HttpStatus.NO_CONTENT);

      response = await request(app.getHttpServer())
        .get('/carts')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      body = response.body;
      carts = body.carts;

      const postLength = carts ? carts.length : 0;

      expect(prevLength).toBe(postLength + 1);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      const cookies = headers['set-cookie'];

      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/carts/100000`)
        .set('Cookie', cookies)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);

    await dataSource.manager.delete(Cart, {});
    await dataSource.manager.delete(User, {});

    await dataSource.destroy();

    await app.close();
  });
});
