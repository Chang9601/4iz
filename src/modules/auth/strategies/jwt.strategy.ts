import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../../modules/users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { buildOption } from '../../../common/factories/common.factory';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // jwtFromRequest은 HTTP 요청에서 JWT를 추출할 위치를 지정한다.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      // ignoreExpiration은 토큰이 만료되었는지 검사를 하는 속성으로 true로 설정하면 만료되더라도 바로 오류를 반환하지 않지만
      // false로 설정해주게 되면 JWT가 만료되지 않았음을 보증하는 책임을 Passport 모듈에 위임한다.
      // 즉, 만약 만료된 JWT를 받았을 경우, 요청은 거부되고 401 상태코드를 포함한 응답을 전달한다.
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET, // configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const { id } = payload;
    const option = buildOption({ id });

    return await this.usersService.findOne(option);
  }
}
