import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PaginationDto } from '../../dtos/pagination.dto';
import { PageDto } from '../../dtos/page.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let adminService: AdminService;
  let usersService: Partial<UsersService>;

  const users: Partial<User>[] = [
    {
      id: 0,
      name: '박선심',
      email: 'sunshim@naver.com',
      password: '12344321!@',
      phoneNumber: '010-1111-2222',
      birthday: new Date('1966-01-01'),
    },
    {
      id: 1,
      name: '윤수빈',
      email: 'subin@naver.com',
      password: '12341234aA!@',
      phoneNumber: '010-1234-5678',
      birthday: new Date('1991-01-01'),
    },
    {
      id: 2,
      name: '관리자',
      email: 'admin@naver.com',
      password: '00000000!@#$',
      phoneNumber: '010-0000-0000',
      birthday: new Date('1996-01-01'),
    },
  ];

  const updateUserDto: UpdateUserDto = {
    phoneNumber: '010-4321-5678',
    password: '12341234aA!',
  };

  beforeEach(async () => {
    usersService = {
      find: async (paginationDto: PaginationDto) => {
        const { search } = paginationDto;
        const result = users.filter((user) =>
          user.name?.includes(search as string),
        ) as User[];

        const total = result.length;
        const pageStateDto = new PageStateDto(total, paginationDto);

        if (pageStateDto.lastPage >= pageStateDto.currentPage) {
          return new PageDto(pageStateDto, result);
        }

        throw new NotFoundException('존재하지 않는 페이지.');
      },
      update: async (id: number, updateUserDto: UpdateUserDto) => {
        const user = users.find((user) => user.id === id) as User;

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

        return user;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  describe('findUsers', () => {
    it('should get an array of users meeting conditions', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 0,
        skip: 0,
        search: '윤수빈',
      };

      const page = await adminService.findUsers(pagination);

      const foundUsers = page.data;
      const state = page.state;

      expect(state.total).toBe(1);
      expect(state.currentPage).toBe(1);
      expect(foundUsers[0].name).toBe(pagination.search);
    });

    it('should throw NotFoundException for a page that does not exist', async () => {
      const pagination: PaginationDto = {
        limit: 10,
        offset: 5,
        skip: 0,
        search: '윤수빈',
      };

      await expect(adminService.findUsers(pagination)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const id = 2;
      const password = users[id].password;
      const phoneNumber = users[id].phoneNumber;

      const user = await adminService.updateUser(id, updateUserDto);

      expect(user.phoneNumber).not.toBe(phoneNumber);
      expect(user.password).not.toBe(password);
    });

    it('should throw NotFoundException for an invalid id', async () => {
      const id = 1021;

      await expect(
        adminService.updateUser(id, updateUserDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});
