import { Injectable } from '@nestjs/common';

import { PaginationDto } from '../../dtos/pagination.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  async findUsers(pagiantionDto: PaginationDto) {
    return await this.usersService.find(pagiantionDto);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }
}
