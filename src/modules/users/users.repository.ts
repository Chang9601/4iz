import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';

export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {
    super(
      usersRepository.target,
      usersRepository.manager,
      usersRepository.queryRunner,
    );
  }

  async findUsers(paginationDto: PaginationDto) {
    const { limit: take, skip } = paginationDto;

    const [users, total] = await this.usersRepository.findAndCount({
      select: ['id', 'name', 'email', 'phoneNumber', 'birthday', 'roles'],
      order: { name: 'ASC' },
      take,
      skip,
    });

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, users);
  }
}
