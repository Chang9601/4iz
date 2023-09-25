import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../../dtos/create-user.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { Role, Token } from '../../common/enums/common.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: {
    signAsync: (
      payload: TokenPayload,
      options: {
        secret: string;
        expiresIn: string | number;
      },
    ) => Promise<string>;
  };
  let configService: {
    get: (key: string) => string;
  };

  const createUserDto: CreateUserDto = {
    name: '박선심',
    email: 'sunshim@naver.com',
    password: '12344321!@',
    phoneNumber: '010-1111-2222',
    birthday: new Date('1966-01-01'),
    role: Role.USER,
  };

  beforeEach(async () => {
    const users: User[] = [];

    usersService = {
      create: async (createUserDto: CreateUserDto) => {
        if (users.find((user) => user.email === createUserDto.email)) {
          throw new ConflictException(`이메일 사용 중.`);
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const roles = [createUserDto.role];

        const user = {
          ...createUserDto,
          id: Math.floor(Math.random() * 10000) + 1,
          password: hashedPassword,
          roles: roles,
        } as Partial<User>;
        users.push(user as User);

        return user as User;
      },

      findOne: async (option: FindOneOptions<User>) => {
        const where = option.where as { email: string };
        const email = where.email;

        const user = users.find((user) => user.email === email);

        if (!user) {
          throw new NotFoundException('이메일에 해당하는 사용자 없음.');
        }

        return user;
      },
    };

    jwtService = {
      signAsync: async (
        payload: TokenPayload,
        options: {
          secret: string;
          expiresIn: string | number;
        },
      ) => {
        const accessToken = payload.id + options.secret;

        return accessToken;
      },
    };

    configService = {
      get: (key: string) => {
        if (key === 'JWT_ACCESS_TOKEN_SECRET') {
          return 'access-token-secret-key';
        } else if (key === 'JWT_ACCESS_TOKEN_EXPIRATION') {
          return '1800000';
        } else if (key === 'JWT_REFRESH_TOKEN_SECRET') {
          return 'refresh-token-secret-key';
        } else if (key === 'JWT_REFRESH_TOKEN_EXPIRATION') {
          return '3600000';
        } else {
          return 'none';
        }
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a user', async () => {
      const user = await authService.signUp(createUserDto);

      expect(user).toBeDefined();
      expect(user.password).not.toBe(createUserDto.password);
    });

    it('should throw ConflictException for duplicate email', async () => {
      await authService.signUp(createUserDto);
      await expect(authService.signUp(createUserDto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });

  describe('createToken', () => {
    it('should create an access token', async () => {
      const id = Math.floor(Math.random() * 10000) + 1;
      const { token: accessToken } = await authService.createToken(
        id,
        Token.ACCESS_TOKEN,
      );

      expect(accessToken).toBeDefined();
    });
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token', async () => {
      const id = Math.floor(Math.random() * 10000) + 1;
      const { token: refreshToken } = await authService.createToken(
        id,
        Token.REFRESH_TOKEN,
      );

      expect(refreshToken).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate a user with correct email and password', async () => {
      await authService.signUp(createUserDto);

      const user = await authService.validateCredentials(
        createUserDto.email,
        createUserDto.password,
      );

      expect(user).toBeDefined();
      expect(user.email).toEqual(createUserDto.email);
      expect(user.name).toEqual(createUserDto.name);
    });

    it('should throw BadRequestException for invalid password', async () => {
      await authService.signUp(createUserDto);

      await expect(
        authService.validateCredentials(createUserDto.email, 'f13km1lk'),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw BadRequestException for invalid email', async () => {
      await authService.signUp(createUserDto);

      await expect(
        authService.validateCredentials(
          'sdcmklw@example.com',
          createUserDto.password,
        ),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
