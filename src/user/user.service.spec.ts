import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/admin.entity';
import { InsertResult, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { SecurityValidation } from '../utils/security-validation';

describe('UserService', () => {
  const makeSut = () => {
    const adminRepositoryMock = new Repository<Admin>();
    const userRepositoryMock = new Repository<User>();
    const jwtService = new JwtService({
      secret: '1234',
      signOptions: {
        expiresIn: '5d',
      },
    });
    const securityValidation = new SecurityValidation(
      adminRepositoryMock,
      userRepositoryMock,
    );
    const sut = new UserService(
      userRepositoryMock,
      jwtService,
      securityValidation,
    );

    const queryBuilder: any = {
      where: () => queryBuilder,
      addSelect: () => queryBuilder,
      getOne: () => new User(),
    };
    return {
      sut,
      userRepositoryMock,
      jwtService,
      queryBuilder,
      securityValidation,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    email: 'user@example.com',
    password: 'password',
    username: 'user',
  };

  describe('Pass tests', () => {
    it('should register user', () => {
      const { sut, userRepositoryMock, securityValidation } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [{ userId: '1223243234042' }];

      jest.spyOn(securityValidation, 'userExists').mockResolvedValue(undefined);

      jest.spyOn(userRepositoryMock, 'insert').mockResolvedValue(insertResult);

      expect(sut.createUser(payload)).resolves.toBeUndefined();
    });

    it('should use login with success', async () => {
      const { sut, jwtService, securityValidation } = makeSut();
      const user = new User();
      user.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8QWO';
      user.email = payload.email;
      user.username = payload.username;
      user.userId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest
        .spyOn(securityValidation, 'userExists')
        .mockResolvedValue(Promise.resolve(user));

      jwtService.sign = () => '123';

      await expect(sut.loginUser(payload)).resolves.toEqual('123');
    });
  });

  describe('Error tests', () => {
    it('should not register user because email is already registered', () => {
      const { sut, securityValidation } = makeSut();

      jest
        .spyOn(securityValidation, 'userExists')
        .mockResolvedValue(new User());

      expect(sut.createUser(payload)).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });

    it('should not register user', () => {
      const { sut, userRepositoryMock, securityValidation } = makeSut();

      jest.spyOn(securityValidation, 'userExists').mockResolvedValue(undefined);

      jest.spyOn(userRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createUser(payload)).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });

    it('should not found user', () => {
      const { sut, securityValidation } = makeSut();

      jest.spyOn(securityValidation, 'userExists').mockResolvedValue(undefined);

      expect(sut.loginUser(payload)).rejects.toThrow(
        new BadRequestException('User not found'),
      );
    });

    it('should not return the accessToken', async () => {
      const { sut, securityValidation } = makeSut();
      const user = new User();
      user.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8123';
      user.email = payload.email;
      user.username = payload.username;
      user.userId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest.spyOn(securityValidation, 'userExists').mockResolvedValue(user);

      await expect(sut.loginUser(payload)).rejects.toThrow(
        new UnauthorizedException('Please check your login credentials'),
      );
    });
  });
});
