import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// 인터셉터와 미들웨어는 요청과 응답 시 중간에서 사용자 정의 논리를 추가할 수 있다는 점에서 비슷하다.
// 미들웨어는 NestJS의 요청과 응답이 HTTP에서 작동하도록 의도되었기에 HTTP 통신만 처리할 수 있다.
// 그러나 인터셉터는 WebSocket, RPC와 같이 HTTP 이외의 통신도 처리할 수 있다.
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // 로깅은 문제 발생 시 발생 지점과 관련 메시지를 제공하고 사용자의 패턴을 분석하는 경우도 사용된다.
  private readonly logger = new Logger('HTTP');

  // 로그 단계
  // debug 단계는 개발자를 위한 메시지로 개발 및 디버깅 단계에서 사용된다. 애플리케이션의 내부 상태에 대한 자세한 정보를 제공한다.
  // 사용 시기: 개발 단계에서 문제를 추적하고 디버그하는 데 도움이 되는 메시지에 사용된다. 일반적으로 자세하기 때문에 운영 환경에서 적합하지 않다.

  // verbose 단계는 debug 단계와 유사하지만 더 자세하거나 광범위한 정보를 제공할 수 있다. 애플리케이션 상세한 진단을 위해 추가 정보를 생성하는 상세 모드에서 사용된다.
  // 사용 시기: 복잡한 문제를 진단하기 위해 추가적이고 심층적인 정보를 제공하는 메시지에 사용된다. 일반적으로 세부 정보가 필요한 분석을 위해 사용된다.

  // log 단계는 가장 기본적인 로깅 단계이며 일반 정보나 루틴 메시지에 주로 사용된다. 애플리케이션의 정상 작동에 관한 정보를 제공한다.
  // 사용 시기: 경고 또는 오류가 아니지만 애플리케이션의 흐름을 이해하는 데 중요한 메시지에 사용된다.

  // warning 단계는 잠재적인 문제나 처리하지 않으면 문제를 일으킬 수 있는 상황을 나타낸다. 문제가 있을 수 있음을 나타내지만 일반적으로 애플리케이션 정상 작동을 중지시키지는 않는다.
  // 사용 시기: 분석 또는 모니터링 해야 할 잠재적인 문제를 강조하는 메시지에 사용된다.

  // error 단계는 오류 또는 예상치 못한 문제와 관련된 메시지를 기록하는 데 사용된다. 오류가 발생하면 주로 주의가 필요한 문제를 나타낸다.
  // 사용 시기: 실패, 오류 또는 분석 및 수정이 필요한 예외적인 상황을 설명하는 메시지에 사용된다.

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      // url vs. originalUrl
      // 요청의 URL 경로를 나타내며 프로토콜, 호스트 또는 쿼리 매개변수를 포함하지 않고 경로만 포함한다(e.g., https://google.com/users?id=23 -> /users).
      // 요청한 원본 URL 경로을 나타내며 프로토콜, 호스트, 경로 매개변수 및 쿼리 매개변수를 포함한다(e.g., https://google.com/users?id=23 -> /users?id=23).
      // url을 수정하는 미들웨어가 있을 경우 originalUrl은 수정되지 않고 원본 URL을 보존한다.
      const { method, originalUrl } = request;
      const { statusCode, statusMessage } = response;

      const message = `요청: ${method} ${originalUrl} , 응답: ${statusCode} ${statusMessage}`;
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return this.logger.error(message);
      } else if (statusCode >= HttpStatus.BAD_REQUEST) {
        return this.logger.warn(message);
      } else {
        return this.logger.log(message);
      }
    });

    next();
  }
}
