import { UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { JwtService } from '@nestjs/jwt';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
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

    const queryBuilder: any = {
      where: () => queryBuilder,
      addSelect: () => queryBuilder,
      getOne: () => new Admin(),
    };

    const queryBuilderGetMany: any = {
      where: () => queryBuilderGetMany,
      getMany: () => [new Admin()],
    };
    return {
      sut,
      adminRepositoryMock,
      jwtService,
      queryBuilder,
      queryBuilderGetMany,
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
      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(new Admin());
      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(undefined);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(insertResult);
      expect(sut.createAdmin(payload, new Admin())).resolves.toEqual(
        'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d',
      );
    });
    it('should found admin account', () => {
      const { adminRepositoryMock, sut, queryBuilder } = makeSut();

      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilder);

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

    it('should update admin', async () => {
      const { adminRepositoryMock, sut } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 1;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      await expect(sut.updateAdmin(payload, admin)).resolves.toBeUndefined();
    });

    it('should update admin not passing password', async () => {
      const { adminRepositoryMock, sut } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 1;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      const payload2 = {
        ...payload,
        password: '',
      };
      await expect(sut.updateAdmin(payload2, admin)).resolves.toBeUndefined();
    });

    it('should get admins', () => {
      const { adminRepositoryMock, sut, queryBuilderGetMany } = makeSut();

      jest.spyOn(sut, 'adminExists').mockResolvedValue(new Admin());

      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilderGetMany);

      expect(sut.getAdmins(new Admin(), '')).resolves.toEqual([new Admin()]);
    });

    it('should get admins filter by email', () => {
      const { adminRepositoryMock, sut, queryBuilderGetMany } = makeSut();

      jest.spyOn(sut, 'adminExists').mockResolvedValue(new Admin());

      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilderGetMany);

      expect(sut.getAdmins(new Admin(), 'admin@email.com')).resolves.toEqual([
        new Admin(),
      ]);
    });
  });

  describe('Error tests', () => {
    it('should not found admin account', () => {
      const { sut } = makeSut();
      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new UnauthorizedException('Admin account not found'),
      );
    });
    it('should return error message about email already in use', () => {
      const { sut } = makeSut();
      jest.spyOn(sut, 'adminExists').mockResolvedValue(new Admin());

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });
    it('should not register the admin', () => {
      const { adminRepositoryMock, sut } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [];
      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(new Admin());
      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(undefined);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });

    it('should not found admin', () => {
      const { adminRepositoryMock, sut, queryBuilder } = makeSut();

      jest.spyOn(queryBuilder, 'getOne').mockReturnValue(undefined);
      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilder);

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

    it('should not found admin account', () => {
      const { sut } = makeSut();
      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);

      expect(sut.updateAdmin(payload, new Admin())).rejects.toThrow(
        new UnauthorizedException(
          'You are not connected or not allowed to update',
        ),
      );
    });

    it('should return error messge email already in use', () => {
      const { sut } = makeSut();

      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      const admin2 = new Admin();
      admin2.password = 'password';
      admin2.email = 'joao@silva.com';
      admin2.username = payload.username;

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin2);

      expect(sut.updateAdmin(payload, admin)).rejects.toThrow(
        new BadRequestException('This email already in use'),
      );
    });

    it('should not update admin', async () => {
      const { adminRepositoryMock, sut } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 0;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(sut, 'adminExists').mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      await expect(sut.updateAdmin(payload, admin)).rejects.toThrow(
        new BadRequestException('Could not update account'),
      );
    });

    it('should not found admin account when get admins', () => {
      const { sut } = makeSut();

      jest.spyOn(sut, 'adminExists').mockResolvedValue(undefined);

      expect(sut.getAdmins(new Admin(), '')).rejects.toThrow(
        new UnauthorizedException('Admin account not found'),
      );
    });
  });
});
