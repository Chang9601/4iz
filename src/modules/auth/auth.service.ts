import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { Token } from '../../common/enums/common.enum';
import { buildOption } from '../../common/factories/common.factory';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersSerivce: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    return await this.usersSerivce.create(createUserDto);
  }

  async createToken(id: number, type: Token) {
    try {
      const payload: TokenPayload = { id };
      const tokenSecret =
        type === Token.ACCESS_TOKEN
          ? 'JWT_ACCESS_TOKEN_SECRET'
          : 'JWT_REFRESH_TOKEN_SECRET';
      const tokenExpiresIn =
        type === Token.ACCESS_TOKEN
          ? 'JWT_ACCESS_TOKEN_EXPIRATION'
          : 'JWT_REFRESH_TOKEN_EXPIRATION';

      const token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(tokenSecret),
        expiresIn: this.configService.get<string>(tokenExpiresIn),
      });

      return { token };
    } catch (error) {
      throw new InternalServerErrorException(
        `${
          type === Token.ACCESS_TOKEN ? '접근 토큰' : '새로고침 토큰'
        } 생성 중 오류 발생.`,
      );
    }
  }

  async validateCredentials(email: string, password: string) {
    try {
      const option = buildOption({ email });
      const user = await this.usersSerivce.findOne(option);
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new BadRequestException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw new BadRequestException(
          '유효하지 않은 이메일 혹은 유효하지 않은 비밀번호.',
        );
      }

      throw new InternalServerErrorException(
        '이메일과 비밀번호로 인증 중 오류 발생.',
      );
    }
  }
}
