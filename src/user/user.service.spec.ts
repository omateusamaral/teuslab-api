import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InsertResult, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  const makeSut = () => {
    const userRepositoryMock = new Repository<User>();
    const jwtService = new JwtService({
      secret: '1234',
      signOptions: {
        expiresIn: '5d',
      },
    });
    const sut = new UserService(userRepositoryMock, jwtService);

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
    it('should found user account', () => {
      const { userRepositoryMock, sut, queryBuilder } = makeSut();

      jest
        .spyOn(userRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilder);

      expect(sut.userExists(payload.email)).resolves.toEqual(new User());
    });
    it('should register user', () => {
      const { sut, userRepositoryMock } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [{ userId: '1223243234042' }];

      jest.spyOn(sut, 'userExists').mockResolvedValue(undefined);

      jest.spyOn(userRepositoryMock, 'insert').mockResolvedValue(insertResult);

      expect(sut.createUser(payload)).resolves.toBeUndefined();
    });
  });

  describe('Error tests', () => {
    it('should not found user', () => {
      const { userRepositoryMock, sut, queryBuilder } = makeSut();

      jest.spyOn(queryBuilder, 'getOne').mockReturnValue(undefined);
      jest
        .spyOn(userRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilder);

      expect(sut.userExists(payload.email)).resolves.toEqual(undefined);
    });

    it('should not register user because email is already registered', () => {
      const { sut } = makeSut();

      jest.spyOn(sut, 'userExists').mockResolvedValue(new User());

      expect(sut.createUser(payload)).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });

    it('should not register user', () => {
      const { sut, userRepositoryMock } = makeSut();

      jest.spyOn(sut, 'userExists').mockResolvedValue(undefined);

      jest.spyOn(userRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createUser(payload)).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });
  });
});
