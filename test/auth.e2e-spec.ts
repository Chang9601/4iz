import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignInDto } from 'src/auth/dtos/signin.dto';

describe('Auth System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should throw a BadRequestException with an invalid email', async () => {
    const signInDto: SignInDto = {
      email: 'sunshim631212@naver.com',
      password: '1234Aa!@',
    };

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(400);
  });

  it('should throw a BadRequestException with an invalid password', async () => {
    const signInDto: SignInDto = {
      email: 'sunshim63@naver.com',
      password: '1234Aa!@%$',
    };

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(400);
  });

  it('should sign in a user', async () => {
    const signInDto: SignInDto = {
      email: 'sunshim63@naver.com',
      password: '1234Aa!@',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(200);

    const body = res.body;
    const accessToken = body.accessToken;

    expect(accessToken).toBeDefined();
  });

  afterEach(() => app.close());
});
