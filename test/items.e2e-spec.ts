import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Items System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should get a single item', async () => {
    const id = 17;
    const uri = encodeURI(`/items/${id}`);
    return request(app.getHttpServer())
      .get(uri)
      .expect(200)
      .then((res) => {
        const body = res.body;
        const item = body.item;

        expect(item.id).toBe(id);
        expect(item.name).toBe('나이키 프리미엄 슈즈');
      });
  });

  it('should throw a NotFoundException', async () => {
    const id = 100;
    const uri = encodeURI(`/items/${id}`);
    return request(app.getHttpServer()).get(uri).expect(404);
  });

  it('should get an array of items', async () => {
    const uri = encodeURI(
      '/items?sort=high&search=나이키&gender=여성&color=검정&color=멀티컬러&category=테니스',
    );
    return request(app.getHttpServer())
      .get(uri)
      .expect(200)
      .then((res) => {
        const body = res.body;
        const total = body.total;
        const offset = body.offset;
        const items = body.items;

        expect(total).toBe(4);
        expect(offset).toBe(1);
        expect(items[0].gender).toBe('여성');
        expect(items[2].name).toBe('나이키코트 울트라 슈즈');
      });
  });
});
