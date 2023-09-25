import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// LocalAuthGuard가 어떠한 의존성 주입 구문도 없는데 LocalStrategy를 찾고 적용할 수 있는 이유.
// @UseGuard(LocalAuthGuard) 데코레이터가 추가된 컨트롤러가 실행되면 LocalAuthGuard는 자동으로 PassPortStrategy를 상속받은 LocalStrategy를 찾아서 논리를 수행한다.
// 즉, LocalAuthGuard가 LocalStrategy를 찾을 수 있는 이유는 LocalStrategy가 AuthModule의 프로바이더로 등록 되어 있으며 @nestjs/passport 패키지의 내부 논리에 의해 PassportStrategy를 상속받은 LocalStrategy를 찾아낸다.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
