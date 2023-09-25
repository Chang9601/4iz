import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PaginationDto } from '../../dtos/pagination.dto';
import { UsersDto } from '../../dtos/users.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UserDto } from '../../dtos/user.dto';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { Role } from '../../common/enums/common.enum';

@ApiTags('admin')
// 역할이 'admin'인 사용자만 컨트롤러의 API를 사용할 수 있다.
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiForbiddenResponse({
    description: '역할이 없어 API 사용 불가능.',
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 페이지',
  })
  @ApiQuery({
    type: PaginationDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(UsersDto)
  @Get('/users')
  async getUsers(@Query() paginationDto: PaginationDto) {
    return await this.adminService.findUsers(paginationDto);
  }

  @ApiForbiddenResponse({
    description: '역할이 없어 API 사용 불가능.',
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않아 API 사용 불가능.',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 사용자',
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Serialize(UserDto)
  @Patch('/users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.adminService.updateUser(id, updateUserDto);
  }
}
