import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import { SignUpDto } from './dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';

const signUpDto: SignUpDto = {
  name: 'Chang',
  password: '1234',
  email: 'chang1234@gmail.com',
  phoneNumber: '010-1234-5678',
  birthday: new Date('1996-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: Partial<UsersRepository>;
  let mockJwtService: JwtService;

  beforeEach(async () => {
    const mockUsers: User[] = [];

    mockUsersRepository = {
      createUser: async (
        name: string,
        email: string,
        password: string,
        phoneNumber: string,
        birthday: Date,
      ) => {
        if (mockUsers.find((mockUser) => mockUser.email === email)) {
          throw new ConflictException(
            `User with email ${email} already exists`,
          );
        }

        const user = {
          id: Math.floor(Math.random() * 10000) + 1,
          name: name,
          email: email,
          password: password,
          phoneNumber: phoneNumber,
          birthday: birthday,
        } as User;
        mockUsers.push(user);

        return user;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.signUp(signUpDto);

    expect(user.password).not.toBe('1234');
    expect(user.name).toBe('Chang');
    expect(user.email).toBe('chang1234@gmail.com');
  });

  it('should throw a ConflictException for a duplicate email', async () => {
    await service.signUp(signUpDto);
    await expect(service.signUp(signUpDto)).rejects.toThrowError(
      ConflictException,
    );
  });
});
