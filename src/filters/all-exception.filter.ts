import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

// ExceptionFilter는 catch() 메서드를 구현해야 한다는 것을 정의하는 인터페이스.
// NestJS의 예외 필터가 기본적으로 어떻게 작동하는지 신경 쓰지 않거나 원하지 않는 경우(즉, 사용자 정의 논리를 작성) 주로 사용한다.
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdpaterHost: HttpAdapterHost) {}

  // ArgumentsHost 클래스는 핸들러에 전달되는 인자를 검색하는 데 사용되는 메서드를 제공한다.
  // 인자를 검색할 때 적절한 컨텍스트(e.g., HTTP, RPC(마이크로서비스) 또는 WebSockets)를 선택할 수 있다.
  // 즉, ArgumentsHost는 핸들러의 인자 위에 추상화 역할을 한다
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdpaterHost;

    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    console.log(exception);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 오류 발생.';
    const timestamp = new Date().toISOString();
    const path = httpAdapter.getRequestUrl(request);

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as {
        statusCode: string;
        message: string | string[];
        error: string;
      };

      // 만약 예외가 하나가 해당 예외의 메시지만 선택한다.
      // 만약 예외가 여러 개일 경우 모든 예외 메시지를 '|'로 분리하여 합친다.
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(' | ')
        : exceptionResponse.message;

      statusCode = exception.getStatus();
    }

    const body = {
      statusCode,
      message,
      timestamp,
      path,
    };

    httpAdapter.reply(response, body, statusCode);
  }
}
