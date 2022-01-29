import { UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { JwtService } from '@nestjs/jwt';
import { InsertResult, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const makeSut = () => {
    const adminRepositoryMock = new Repository<Admin>();
    const jwtService = new JwtService({
      secret: '1234',
      signOptions: {
        expiresIn: '5d',
      },
    });
    const sut = new AdminService(adminRepositoryMock, jwtService);

    return {
      sut,
      adminRepositoryMock,
      jwtService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    email: 'admin@example.com',
    password: 'password',
    username: 'admin',
  };
  describe('Pass tests', () => {
    it('should register a new admin', () => {
      const { adminRepositoryMock, sut } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [{ adminId: 'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d' }];
      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(insertResult);

      expect(sut.createAdmin(payload)).resolves.toEqual(
        'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d',
      );
    });
    it('should found admin account', () => {
      const { adminRepositoryMock, sut } = makeSut();

      jest.spyOn(adminRepositoryMock, 'findOne').mockResolvedValue(new Admin());

      expect(sut.adminExists(payload.email)).resolves.toEqual(new Admin());
    });
    it('should admin login with success', async () => {
      const { sut, jwtService } = makeSut();
      const admin = new Admin();
      admin.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8QWO';
      admin.email = payload.email;
      admin.username = payload.username;
      admin.adminId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest.spyOn(sut, 'adminExists').mockResolvedValue(admin);

      jwtService.sign = () => '123';

      await expect(sut.loginAdmin(payload)).resolves.toEqual('123');
    });
  });

  describe('Error tests', () => {
    it('should return error message', () => {
      const { sut } = makeSut();
      jest.spyOn(sut, 'adminExists').mockResolvedValue(new Admin());

      expect(sut.createAdmin(payload)).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });
    it('should not register the admin', () => {
      const { adminRepositoryMock, sut } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [];
      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createAdmin(payload)).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });

    it('should not found admin', () => {
      const { adminRepositoryMock, sut } = makeSut();

      jest.spyOn(adminRepositoryMock, 'findOne').mockResolvedValue(undefined);

      expect(sut.adminExists(payload.email)).resolves.toEqual(undefined);
    });

    it('should not found admin email', () => {
      const { sut } = makeSut();

      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);
      expect(sut.loginAdmin(payload)).rejects.toThrow(
        new BadRequestException('Email not found'),
      );
    });

    it('should not return the accessToken', async () => {
      const { sut } = makeSut();
      const admin = new Admin();
      admin.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8123';
      admin.email = payload.email;
      admin.username = payload.username;
      admin.adminId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest.spyOn(sut, 'adminExists').mockResolvedValue(admin);

      await expect(sut.loginAdmin(payload)).rejects.toThrow(
        new UnauthorizedException('Please check your login credentials'),
      );
    });
  });
});
