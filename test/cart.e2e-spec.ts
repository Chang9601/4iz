import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SignInDto } from 'src/auth/dtos/signin.dto';
import { RequestCreateCartDto } from 'src/carts/dto/request.create-cart.dto';
import { RequestUpdateCartDto } from 'src/carts/dto/request.update-cart.dto';

describe('Cart System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should creaet a cart', async () => {
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

    const requestCreateCartDto: RequestCreateCartDto = {
      itemId: 12,
      options: ['검정색/220/2', '노란색/290/4', '멀티컬러/260/6'],
    };

    const cartRes = await request(app.getHttpServer())
      .post('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestCreateCartDto)
      .expect(201);

    const cartBody = cartRes.body;

    expect(cartBody).toHaveLength;
    expect(cartBody[0].totalQuantity).toBe(2);
    expect(cartBody[1].option.color).toBe('노란색');
    expect(cartBody[2].option.size).toBe('260');
  });

  it('should get an arry of carts', async () => {
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

    const cartRes = await request(app.getHttpServer())
      .get('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const cartBody = cartRes.body;

    expect(cartBody).toHaveLength;
    expect(cartBody).toHaveProperty('total');
    expect(cartBody).toHaveProperty('carts');
    expect(cartBody.offset).toBe(1);
  });

  it('should update a cart', async () => {
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

    const requestUpdateRequestCart: RequestUpdateCartDto = {
      quantity: 10,
    };

    const getCartsRes = await request(app.getHttpServer())
      .get('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const getCartBody = getCartsRes.body;
    const carts = getCartBody.carts;
    const cartsLength = carts.length;

    const id = carts[cartsLength - 1].cart_id;
    const uri = encodeURI(`/carts/${id}`);

    const updateCartRes = await request(app.getHttpServer())
      .patch(uri)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestUpdateRequestCart)
      .expect(200);

    const updateCartBody = updateCartRes.body;

    expect(updateCartBody.id).toBe(id);
    expect(updateCartBody.totalQuantity).toBe(
      requestUpdateRequestCart.quantity,
    );
  });

  it('should throw a NotFoundException for updating an invalid cart', async () => {
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

    const requestUpdateRequestCart: RequestUpdateCartDto = {
      quantity: 10,
    };

    const getCartsRes = await request(app.getHttpServer())
      .get('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const getCartBody = getCartsRes.body;
    const carts = getCartBody.carts;
    const cartsLength = carts.length;

    const id = carts[cartsLength - 1].cart_id + 100;
    const uri = encodeURI(`/carts/${id}`);

    await request(app.getHttpServer())
      .patch(uri)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestUpdateRequestCart)
      .expect(404);
  });

  it('should delete a cart', async () => {
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

    const getCartsRes = await request(app.getHttpServer())
      .get('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const getCartBody = getCartsRes.body;
    const carts = getCartBody.carts;
    const cartsLength = carts.length;

    const id = carts[cartsLength - 1].cart_id;
    const uri = encodeURI(`/carts/${id}`);

    await request(app.getHttpServer())
      .delete(uri)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('should throw a NotFoundException for deleting an invalid cart', async () => {
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

    const getCartsRes = await request(app.getHttpServer())
      .get('/carts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const getCartBody = getCartsRes.body;
    const carts = getCartBody.carts;
    const cartsLength = carts.length;

    const id = carts[cartsLength - 1].cart_id + 100;
    const uri = encodeURI(`/carts/${id}`);

    await request(app.getHttpServer())
      .delete(uri)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  afterEach(() => app.close());
});
