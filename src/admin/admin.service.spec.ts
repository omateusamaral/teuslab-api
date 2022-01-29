import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { InsertResult, Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const makeSut = () => {
    const adminRepositoryMock = new Repository<Admin>();
    const sut = new AdminService(adminRepositoryMock);

    return {
      sut,
      adminRepositoryMock,
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
      jest.spyOn(sut, 'adminExists').mockResolvedValue(false);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(insertResult);

      expect(sut.createAdmin(payload)).resolves.toEqual(
        'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d',
      );
    });
  });

  describe('Error tests', () => {
    it('should return error message', () => {
      const { sut } = makeSut();
      jest.spyOn(sut, 'adminExists').mockResolvedValue(true);

      expect(sut.createAdmin(payload)).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });
    it('should not register the admin', () => {
      const { adminRepositoryMock, sut } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [];
      jest.spyOn(sut, 'adminExists').mockResolvedValue(false);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createAdmin(payload)).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });
  });
});
