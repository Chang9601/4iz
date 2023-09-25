import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { User } from '../src/entities/user.entity';

describe('Authentication E2E Test', () => {
  let app: INestApplication;

  let createUserDto: {
    name: string;
    password: string;
    email: string;
    phoneNumber: string;
    birthday: string | Date;
  };

  let credentials: {
    email: string;
    password: string;
  };

  beforeEach(async () => {
    createUserDto = {
      name: '박선심',
      password: '1234Aa!@',
      email: 'sunshim@naver.com',
      phoneNumber: '010-1234-5678',
      birthday: '1966-01-01',
    };

    credentials = {
      email: 'sunshim@naver.com',
      password: '1234Aa!@',
    };

    // AppModule 클래스에 존재하는 모든 모듈과 설정을 가져온다.
    // 따라서 main.ts 파일의 부트스트랩 함수의 설정은 무시된다.
    // compile() 메서드로 AppModule을 의존성과 함께 부트스트랩하고 모듈을 반환한다.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // NestJS 런타임 환경을 인스턴스화.
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('signUp', () => {
    it('should throw BadRequestException for an invalid name', async () => {
      createUserDto.name = '박선';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid password', async () => {
      createUserDto.password = '1234';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid email', async () => {
      createUserDto.email = 'sunshim';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid phone number', async () => {
      createUserDto.phoneNumber = '010-123-4567';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid birthday', async () => {
      createUserDto.birthday = '1966-01-00';

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const body = response.body;

      expect(body.password).not.toBe(createUserDto.password);
      expect(body.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException for a duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(createUserDto)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('signIn', () => {
    it('should throw BadRequestException for an invalid email', async () => {
      credentials.email = 'sfaslkf@naver.com';

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw BadRequestException for an invalid password', async () => {
      credentials.password = '24391!@svz';

      await request(app.getHttpServer())
        .post('/auth/signin')
        .send(credentials)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should sign in a user', async () => {
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

      const cookies = headers['set-cookie'].map(
        (cookie: string) => cookie.split(';')[0],
      );

      const accessToken = cookies
        .find((cookie: string) => cookie.includes('access_token'))
        .split('=')[1];
      const refreshToken = cookies
        .find((cookie: string) => cookie.includes('refresh_token'))
        .split('=')[1];

      const body = response.body;

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(body.email).toBe(credentials.email);
      expect(body.phoneNumber).toBe(createUserDto.phoneNumber);
    });
  });

  describe('signOut', () => {
    it('should sign out a user', async () => {
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

      let cookies = headers['set-cookie'];

      response = await request(app.getHttpServer())
        .post('/auth/signout')
        .set('Cookie', cookies)
        .expect(HttpStatus.NO_CONTENT);

      cookies = response.headers['set-cookie'].map(
        (cookie: string) => cookie.split(';')[0],
      );

      const accessToken = cookies
        .find((cookie: string) => cookie.includes('access_token'))
        .split('=')[1];
      const refreshToken = cookies
        .find((cookie: string) => cookie.includes('refresh_token'))
        .split('=')[1];

      expect(accessToken).toBe('');
      expect(refreshToken).toBe('');
    });
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);

    await dataSource.manager.delete(User, {});

    await dataSource.destroy();

    await app.close();
  });
});
