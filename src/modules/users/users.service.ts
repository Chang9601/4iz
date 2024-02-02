import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { PaginationDto } from '../../dtos/pagination.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { OAuthProfileDto } from '../../dtos/oauth-profile.dto';
import { MySqlErrorCode } from '../../databases/mysql-error-code.enum';
import { User } from '../../entities/user.entity';
import { UsersRepository } from './users.repository';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { buildOption } from '../../common/factories/common.factory';
import { Role } from '../../common/enums/common.enum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const roles = [createUserDto.role];

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error?.errno === MySqlErrorCode.DUPLICATE_ENTRY) {
        throw new ConflictException('이메일 사용 중.');
      }

      throw error;
    }
  }

  async createWithOAuth(oAuthProfileDto: OAuthProfileDto) {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(oAuthProfileDto.oAuthProviderId, salt);
    const roles = [Role.USER];

    const user = this.usersRepository.create({
      ...oAuthProfileDto,
      password,
      roles,
    });

    return await this.usersRepository.save(user);
  }

  async updateOAuthProviderRefreshToken(
    id: number,
    oAuthProviderRefreshToken: string,
  ) {
    await this.usersRepository.update(id, {
      oAuthProviderRefreshToken,
    });

    const option = buildOption({ id });
    const user = await this.findOne(option);

    return user;
  }

  async setRefreshToken(refreshToken: string, id: number) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await this.usersRepository.update(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async removeRefreshToken(id: number) {
    await this.usersRepository.update(id, { refreshToken: null });
  }

  async findByRefreshToken(refreshToken: string, option: FindOneOptions<User>) {
    const user = await this.findOne(option);

    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken as string,
    );

    if (!refreshTokenMatch) {
      throw new NotFoundException('새로고침 토큰 불일치.');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const option = buildOption({ id });
    const user = await this.findOne(option);

    const { password, phoneNumber } = updateUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = password
      ? await bcrypt.hash(password, salt)
      : user.password;

    if (password) {
      user.password = hashedPassword;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    return await this.usersRepository.save(user);
  }

  async find(paginationDto: PaginationDto) {
    return await this.usersRepository.findUsers(paginationDto);
  }

  async findOne(option: FindOneOptions<User>) {
    const user = await this.usersRepository.findOne(option);

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자.');
    }

    return user;
  }

  async exist(option: FindManyOptions<User>) {
    return await this.usersRepository.exist(option);
  }
}
