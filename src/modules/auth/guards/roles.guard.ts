import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { User } from '../../../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../../common/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  // 경로에 설정된 역할(즉, 사용자 정의 메타데이터)에 접근하기 위해 Reflector 클래스를 사용한다.
  // Reflector 클래스의 메서드는 컨트롤러와 메서드의 메타데이터를 동시에 추출하고 다양한 방식으로 병합한다.
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 경로에 설정된 역할(컨트롤러, 메서드)을 가져온다.
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // NodeJS에서는 일반적으로 인증된 사용자를 request 객체에 첨부한다. 다시말해, 인증 가드에서 인증이 완료되면 사용자를 request 객체에 첨부한다.
    const user = request.user as User;

    // 사용자, 사용자의 역할, 경로가 필요한 역할을 가지고 있는 경우만 허용한다.
    const authorized =
      user && user.roles && roles.some((role) => user.roles?.includes(role));

    if (authorized) {
      return true;
    }

    throw new ForbiddenException('역할 없음.');
  }
}
