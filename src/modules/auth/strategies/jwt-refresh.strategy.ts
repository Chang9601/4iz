import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../../modules/users/users.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { buildOption } from '../../../common/factories/common.factory';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET, // configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      // passReqToCallback은 validate() 메서드의 1번 인자로 Request 객체를 전달할지 여부를 결정한다.
      // true로 설정하면 validate() 메서드 1번 인자로 Request 객체를 전달할 수 있다.
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken = request?.cookies?.refresh_token;
    const { id } = payload;
    const option = buildOption({ id });

    return await this.usersService.findByRefreshToken(refreshToken, option);
  }
}
