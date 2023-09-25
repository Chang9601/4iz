import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { PaginationDto } from '../src/dtos/pagination.dto';
import { CreateUserDto } from '../src/dtos/create-user.dto';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/common/enums/common.enum';

describe('Admin E2E Test', () => {
  let app: INestApplication;

  const createUserDto: CreateUserDto = {
    name: '관리자',
    password: '1234Aa!@',
    email: 'admin@naver.com',
    phoneNumber: '010-0000-0000',
    birthday: new Date('1996-01-01'),
    role: Role.ADMIN,
  };

  const credentials = {
    email: 'admin@naver.com',
    password: '1234Aa!@',
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

  describe('getUsers', () => {
    it('should get an array of users meeting conditions', async () => {
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

      response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.OK);

      const body = response.body;
      const users = body.users;
      const pageState = body.pageState;

      expect(users).toBeDefined();
      expect(pageState.total).toBeDefined();
      expect(pageState.currentPage).toBeDefined();
      expect(pageState.lastPage).toBeDefined();
    });

    it('should throw ForbiddenException for not being authorized', async () => {
      createUserDto.role = Role.USER;

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      let response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.OK);

      const cookies = response.headers['set-cookie'];

      response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Cookie', cookies)
        .query(paginationDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);

    await dataSource.manager.delete(User, {});

    await dataSource.destroy();

    await app.close();
  });
});
