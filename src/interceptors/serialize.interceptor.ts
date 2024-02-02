import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

// DTO를 매개변수로 받는 데코레이터로 DTO를 기반으로 응답 데이터를 직렬화하기 위해 SerializeInterceptor를 적용한다.
// 데코레이터 팩토리는 데코레이터가 실행시간에 호출할 표현식을 반환하는 함수이다.
export function Serialize(dto: any) {
  // 데코레이터 함수
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  // ExecutionContext은 ArgumentsHost를 확장하며 현재 실행 프로세스에 대한 추가적인 세부 정보를 제공한다.
  // CallHandler 인터페이스는 handle() 메서드를 구현하며 이를 통해 인터셉터 내에서 경로 핸들러 메서드를 언제든지 호출할 수 있다.
  // intercept() 메서드 구현에서 handle() 메서드를 호출하지 않으면 경로 핸들러 메서드가 실행되지 않는다.
  // intercept() 메서드는 요청/응답 스트림을 래핑(wrap)한다. 즉, 최종 경로 핸들러의 실행 전후에 사용자 정의 논리를 구현할 수 있다.
  // intercept() 메서드에서 handle()을 호출하기 전에 코드를 작성할 수 있으며 handle() 메서드는 Observable을 반환하므로 RxJS 연산자를 사용하여 응답을 추가로 조작할 수 있다.
  // 다시 말해, 스트림에는 경로 핸들러에서 반환된 값이 포함되어 있으며  RxJS의 map() 연산자를 사용하여 쉽게 변형할 수 있다.
  // 관점 지향 프로그래밍 용어를 사용하면 경로 핸들러의 호출(즉, handle() 호출)은 포인트컷(Pointcut)이라고 불리며 이는 추가 논리가 삽입되는 지점이다.
  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          // excludeExtraneousValues 옵션이 true면 data 객체에  DTO에 대응되는 속성이 없는 경우 해당 속성을 제외한다.
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
