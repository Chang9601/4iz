import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // passport-local 전략은 기본적으로 요청 본문에 username 및 password라는 속성을 예상하지만 옵션 객체로 다른 속성 이름을 지정할 수 있다.
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string) {
    return await this.authService.validateCredentials(email, password);
  }
}
