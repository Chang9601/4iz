import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { CreateCartDto } from '../src/dtos/create-cart.dto';
import { PaginationDto } from '../src/dtos/pagination.dto';
import { CreateOrderDto } from '../src/dtos/create-order.dto';
import { Cart } from '../src/entities/cart.entity';
import { User } from '../src/entities/user.entity';
import { OrderToOption } from '../src/entities/order-option.entity';
import { Order } from '../src/entities/order.entity';
import { Role } from '../src/common/enums/common.enum';

describe('Order E2E Test', () => {
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

  const createOrderDto: CreateOrderDto = {
    streetAddress: '부산광역시 기장군 일광읍 기장대로 692',
    address: '4층 정장계',
    zipcode: '46044',
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

  describe('placeOrder', () => {
    it('should place an order', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      expect(headers).toBeDefined();

      const cookies = headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', cookies)
        .send(createOrderDto)
        .expect(HttpStatus.CREATED);

      const body = response.body;

      expect(body.id).toBeDefined();
      expect(body.orderNumber).toBeDefined();
    });

    it('should throw NotFoundException for empty carts', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      expect(headers).toBeDefined();

      const cookies = headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', cookies)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('getOrders', () => {
    it('should get an array of orders for a user meeting conditions', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      expect(headers).toBeDefined();

      const cookies = headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', cookies)
        .send(createOrderDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .get('/orders')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      const body = response.body;
      const orders = body.orders;
      const pageState = body.pageState;

      expect(orders).toBeDefined();
      expect(pageState.total).toBe(1);
      expect(pageState.currentPage).toBe(1);
      expect(pageState.isPreviousPageValid).toBe(false);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const headers = response.headers;
      expect(headers).toBeDefined();

      const cookies = headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/carts')
        .set('Cookie', cookies)
        .send(createCartDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Cookie', cookies)
        .send(createOrderDto)
        .expect(HttpStatus.CREATED);

      response = await request(app.getHttpServer())
        .get('/orders')
        .set('Cookie', cookies)
        .expect(HttpStatus.OK);

      let body = response.body;
      let orders = body.orders;

      const prevLength = orders.length;

      response = await request(app.getHttpServer())
        .delete(`/orders/${response.body.orders[0].id}`)
        .set('Cookie', cookies)
        .expect(HttpStatus.NO_CONTENT);

      response = await request(app.getHttpServer())
        .get('/orders')
        .set('Cookie', cookies);

      body = response.body;
      orders = body.orders;

      const postLength = orders ? orders.length : 0;

      expect(prevLength).toBe(postLength + 1);
    });
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);

    await dataSource.manager.delete(OrderToOption, {});
    await dataSource.manager.delete(Order, {});
    await dataSource.manager.delete(Cart, {});
    await dataSource.manager.delete(User, {});

    await dataSource.destroy();

    await app.close();
  });
});
