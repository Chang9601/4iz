import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignInDto } from 'src/auth/dtos/signin.dto';
import { RequestCreateOrderDto } from 'src/orders/dto/request.create-order.dto';

describe('Order System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create an order', async () => {
    const signInDto: SignInDto = {
      email: 'sunshim63@naver.com',
      password: '1234Aa!@',
    };

    const authRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(signInDto)
      .expect(200);

    const authBody = authRes.body;
    const accessToken = authBody.accessToken;

    expect(accessToken).toBeDefined();

    const requestCreateOrderDto: RequestCreateOrderDto = {
      name: '박선심',
      email: 'sunshim63@naver.com',
      phoneNumber: '010-1111-2222',
      address: '4층 정장계',
      street: '부산광역시 기장군 일광읍 기장대로 692',
      zipcode: '46044',
    };

    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestCreateOrderDto)
      .expect(201);

    const orderBody = orderRes.body;

    expect(orderBody).toHaveProperty('totalPrice');
    expect(orderBody).toHaveProperty('totalQuantity');
    expect(orderBody).toHaveProperty('orderNumber');
    expect(orderBody).toHaveProperty('orderStatus');
  });
});
