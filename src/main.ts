import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('4iz API')
    .setDescription('스포츠 의류를 판매하는 서비스 4iz의 API 문서화')
    .setVersion('1.0')
    .addTag('4iz')
    .addCookieAuth('token cookie')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('PORT') || 3000);
}
bootstrap();
