import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { User } from '../../entities/user.entity';
import { Role } from '../../common/enums/common.enum';
import { buildOption } from '../../common/factories/common.factory';

const createUserDto: CreateUserDto = {
  name: '박선심',
  email: 'sunshim@naver.com',
  password: '12344321!@',
  phoneNumber: '010-1111-2222',
  birthday: new Date('1966-01-01'),
  role: Role.USER,
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: {
    create: (createUserDto: CreateUserDto) => User;
    save: (user: User) => Promise<User>;
    update: (
      id: number,
      options: {
        refreshToken: string;
      },
    ) => Promise<void>;
    findOne: (options: {
      where: {
        id: number;
        email: string;
      };
    }) => Promise<User | null>;
  };

  beforeEach(async () => {
    const users: User[] = [];

    usersRepository = {
      create: (createUserDto: CreateUserDto) => {
        const user = {
          ...createUserDto,
          id: Math.floor(Math.random() * 10000) + 1,
          refreshToken: null,
        } as Partial<User>;

        return user as User;
      },
      save: async (user: User) => {
        users.push(user);

        return user;
      },
      update: async (id, options) => {
        const user = users.find((user) => user.id === id) as User;

        if (user) {
          user.refreshToken = options.refreshToken;
        }

        return;
      },
      findOne: async (options) => {
        const { where } = options;

        if (where.id) {
          const userById = users.find((user) => user.id === where.id);
          if (userById) return userById;
        }
        if (where.email) {
          const userByEmail = users.find((user) => user.email === where.email);
          if (userByEmail) return userByEmail;
        }

        return null;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = await usersService.create(createUserDto);

      expect(user.name).not.toBe(createUserDto.password);
      expect(user.name).toBe(createUserDto.name);
      expect(user.email).toBe(createUserDto.email);
    });
  });

  describe('setRefreshToken | removeRefreshToken', () => {
    it('should set a refresh token', async () => {
      const user = await usersService.create(createUserDto);
      const refreshToken = user.refreshToken;

      await usersService.setRefreshToken('my_refresh_token', user.id);

      expect(user.refreshToken).not.toBe(refreshToken);
    });

    it('should remove a refresh token', async () => {
      const user = await usersService.create(createUserDto);

      await usersService.setRefreshToken('my_refresh_token', user.id);
      const refreshTokenBefore = user.refreshToken;

      await usersService.removeRefreshToken(user.id);
      const refreshTokenAfter = user.refreshToken;

      expect(refreshTokenBefore).not.toBe(refreshTokenAfter);
    });
  });

  describe('findById | findByEmail | findByRefreshToken', () => {
    it('should find a user by id', async () => {
      const user = await usersService.create(createUserDto);
      const id = user.id;
      const option = buildOption({ id });
      const foundUser = await usersService.findOne(option);

      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe(createUserDto.name);
      expect(foundUser.email).toBe(createUserDto.email);
    });

    it('should find a user by email', async () => {
      const user = await usersService.create(createUserDto);
      const email = user.email;
      const option = buildOption({ email });
      const foundUser = await usersService.findOne(option);

      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe(createUserDto.name);
      expect(foundUser.email).toBe(createUserDto.email);
    });

    it('should find a user by refresh token', async () => {
      const user = await usersService.create(createUserDto);
      await usersService.setRefreshToken('my_refresh_token', user.id);

      const foundUser = await usersService.findByRefreshToken(
        'my_refresh_token',
        user.id,
      );

      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe(createUserDto.name);
      expect(foundUser.email).toBe(createUserDto.email);
    });

    it('should throw NotFoundException for a user that does not exist', async () => {
      await usersService.create(createUserDto);
      const id = 1000000;
      const option = buildOption({ id });

      await expect(usersService.findOne(option)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
