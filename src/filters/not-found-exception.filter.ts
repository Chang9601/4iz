import * as path from 'path';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// HTTP 404 페이지 필터.
@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode = exception.getStatus();

    // 전역으로 적용되는 필터라서 다음 HTTP 요청 메서드는 예외를 적용한다.
    const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const method = request.method;

    if (methods.includes(method)) {
      const timestamp = new Date().toISOString();
      const path = request.originalUrl;
      const message = exception.message;

      // 반환문이 없으면 응답이 AllExceptionFilter로 전달되어 두 번의 응답이 전송되어 오류가 발생한다.
      // 반환문을 추가해 클라이언트에 응답을 전송한다.
      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp,
        path,
      });
    }

    // 개발/운영 vs. 테스트
    const options = {
      root:
        process.env.NODE_ENV === 'test'
          ? path.join(__dirname, '..', 'public')
          : path.join(__dirname, '..', '..', 'public'),
    };

    // 주어진 경로의 파일을 전송한다.
    // root 옵션이 옵션 객체에서 설정되지 않은 경우 경로는 파일에 대한 절대 경로여야 한다.
    // HTTP 상태코드가 없으면 장바구니 목록 페이지와 주문 목록 페이지에서 오류가 발생한다.
    response.status(statusCode).sendFile('dne.html', options);
  }
}
