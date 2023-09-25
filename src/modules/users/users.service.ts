import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { PaginationDto } from '../../dtos/pagination.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { MySqlErrorCode } from '../../databases/mysql-error-code.enum';
import { User } from '../../entities/user.entity';
import { UsersRepository } from './users.repository';
import { FindOneOptions } from 'typeorm';
import { buildOption } from '../../common/factories/common.factory';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const roles = [createUserDto.role];

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        roles,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error?.errno === MySqlErrorCode.DUPLICATE_ENTRY) {
        throw new ConflictException('이메일 사용 중.');
      }

      throw new InternalServerErrorException('사용자 생성 중 오류 발생.');
    }
  }

  async setRefreshToken(refreshToken: string, id: number) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

      await this.usersRepository.update(id, {
        refreshToken: hashedRefreshToken,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        '새로고침 토큰 설정 중 오류 발생.',
      );
    }
  }

  async removeRefreshToken(id: number) {
    try {
      await this.usersRepository.update(id, { refreshToken: null });
    } catch (error) {
      throw new InternalServerErrorException(
        '새로고침 토큰 삭제 중 오류 발생.',
      );
    }
  }

  async findByRefreshToken(refreshToken: string, id: number) {
    try {
      const option = buildOption({ id });
      const user = await this.findOne(option);

      const refreshTokenMatch = await bcrypt.compare(
        refreshToken,
        user.refreshToken as string,
      );

      if (!refreshTokenMatch) {
        throw new NotFoundException('새로고침 토큰 불일치.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        '새로고침 토큰으로 인증 중 오류 발생.',
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const option = buildOption({ id });
      const user = await this.findOne(option);

      if (!user) {
        throw new NotFoundException('아이디에 해당하는 사용자 없음.');
      }

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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('사용자 갱신 중 오류 발생.');
    }
  }

  async find(paginationDto: PaginationDto) {
    return await this.usersRepository.findUsers(paginationDto);
  }

  async findOne(option: FindOneOptions<User>) {
    try {
      const user = await this.usersRepository.findOne(option);

      if (!user) {
        throw new NotFoundException('사용자 없음.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('사용자 검색 중 오류 발생.');
    }
  }
}
