import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { SignInDto } from './dtos/signin.dto';
import { BadRequestException } from '@nestjs/common';

const signUpDto: SignUpDto = {
  name: 'Chang',
  password: '1234',
  email: 'chang1234@gmail.com',
  phoneNumber: '010-1234-5678',
  birthday: new Date('1996-01-01'),
};

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    const mockUsers: User[] = [];

    mockAuthService = {
      signUp: async (signUpDto: SignUpDto) => {
        const { name, email, password, phoneNumber, birthday } = signUpDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = {
          id: Math.floor(Math.random() * 10000) + 1,
          name: name,
          email: email,
          password: hashedPassword,
          phoneNumber: phoneNumber,
          birthday: birthday,
        } as User;
        mockUsers.push(user);

        return user;
      },
      signIn: async (signInDto: SignInDto) => {
        const { email, password } = signInDto;
        const mockUser = mockUsers.find((mockUser) => mockUser.email === email);

        if (mockUser && (await bcrypt.compare(password, mockUser.password))) {
          return { accessToken: 'accessToken' };
        } else {
          throw new BadRequestException('Invalid credentials');
        }
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await controller.signUp(signUpDto);

    expect(user.password).not.toBe('1234');
    expect(user.name).toBe('Chang');
    expect(user.email).toBe('chang1234@gmail.com');
  });

  it('should throw a BadRequestException with an invalid email', async () => {
    await controller.signUp(signUpDto);
    await expect(
      controller.signIn({ email: 'young1234@gmail.com', password: '1234' }),
    ).rejects.toThrowError(BadRequestException);
  });

  it('should throw a BadRequestException with an invalid password', async () => {
    await controller.signUp(signUpDto);
    await expect(
      controller.signIn({ email: 'chang1234@gmail.com', password: '5678' }),
    ).rejects.toThrowError(BadRequestException);
  });

  it('should get an access token', async () => {
    await controller.signUp(signUpDto);
    const result = await controller.signIn({
      email: signUpDto.email,
      password: signUpDto.password,
    });

    expect(result.accessToken).toBeDefined();
  });
});
