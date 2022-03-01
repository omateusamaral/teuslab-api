import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { JwtService } from '@nestjs/jwt';
import { SecurityValidation } from '../utils/security-validation';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { User } from '../user/user.entity';
import { RoleType } from '../types/validate-types.interface';

describe('AdminService', () => {
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
    const sut = new AdminService(
      adminRepositoryMock,
      jwtService,
      securityValidation,
      userRepositoryMock,
    );

    const queryBuilder: any = {
      where: () => queryBuilder,
      addSelect: () => queryBuilder,
      getOne: () => new Admin(),
    };

    const queryBuilderGetMany: any = {
      where: () => queryBuilderGetMany,
      getMany: () => [new Admin()],
    };
    const queryBuilderGetUsers: any = {
      where: () => queryBuilderGetUsers,
      getCount: () => 1,
      offset: () => queryBuilderGetUsers,
      limit: () => queryBuilderGetUsers,
      getMany: () => [new User()],
    };
    return {
      sut,
      adminRepositoryMock,
      jwtService,
      queryBuilder,
      queryBuilderGetMany,
      securityValidation,
      userRepositoryMock,
      queryBuilderGetUsers,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    email: 'admin@example.com',
    password: 'password',
    username: 'admin',
    role: RoleType.ADMIN,
  };
  describe('Pass tests', () => {
    it('should register a new admin', () => {
      const { adminRepositoryMock, sut, securityValidation } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [{ adminId: 'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d' }];
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(insertResult);
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(Promise.resolve(new Admin()));

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(Promise.resolve(undefined));
      expect(sut.createAdmin(payload, new Admin())).resolves.toEqual(
        'f434ac20-a6ee-403e-bdfa-0ee3fd7eca9d',
      );
    });

    it('should admin login with success', async () => {
      const { sut, jwtService, securityValidation } = makeSut();
      const admin = new Admin();
      admin.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8QWO';
      admin.email = payload.email;
      admin.username = payload.username;
      admin.adminId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(Promise.resolve(admin));

      jwtService.sign = () => '123';

      await expect(sut.loginAdmin(payload)).resolves.toEqual('123');
    });

    it('should update admin', async () => {
      const { adminRepositoryMock, sut, securityValidation } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 1;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      await expect(sut.updateAdmin(payload, admin)).resolves.toBeUndefined();
    });

    it('should update admin not passing password', async () => {
      const { adminRepositoryMock, sut, securityValidation } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 1;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      const payload2 = {
        ...payload,
        password: '',
      };
      await expect(sut.updateAdmin(payload2, admin)).resolves.toBeUndefined();
    });

    it('should get admins', () => {
      const {
        adminRepositoryMock,
        sut,
        queryBuilderGetMany,
        securityValidation,
      } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(new Admin());
      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilderGetMany);

      expect(sut.getAdmins(new Admin(), '')).resolves.toEqual([new Admin()]);
    });

    it('should get admins filter by email', () => {
      const {
        adminRepositoryMock,
        sut,
        queryBuilderGetMany,
        securityValidation,
      } = makeSut();

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(new Admin());
      jest
        .spyOn(adminRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilderGetMany);

      expect(sut.getAdmins(new Admin(), 'admin@email.com')).resolves.toEqual([
        new Admin(),
      ]);
    });

    it('should admin delete an user', () => {
      const { sut, securityValidation, userRepositoryMock } = makeSut();
      const deleteResult = new DeleteResult();
      deleteResult.affected = 1;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(new Admin());
      jest.spyOn(userRepositoryMock, 'delete').mockResolvedValue(deleteResult);

      expect(
        sut.deleteUser(new Admin(), '8ceffe30-f44b-40c6-96a9-42909c80a3ee'),
      ).resolves.toBeUndefined();
    });

    it('should get users', () => {
      const {
        sut,
        securityValidation,
        userRepositoryMock,
        queryBuilderGetUsers,
      } = makeSut();

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(new Admin());

      jest
        .spyOn(userRepositoryMock, 'createQueryBuilder')
        .mockReturnValue(queryBuilderGetUsers);

      expect(
        sut.getUsers(new Admin(), 1, 10, 'user@email.com'),
      ).resolves.toEqual({
        users: [new User()],
        page: 1,
        usersPerPage: 10,
        countUsers: 1,
      });
    });
  });

  describe('Error tests', () => {
    it('should return error message about email already in use', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(new Admin());

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(new Admin());

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
    });
    it('should not register the admin', () => {
      const { adminRepositoryMock, sut, securityValidation } = makeSut();
      const insertResult = new InsertResult();
      insertResult.raw = [];
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(new Admin());

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(undefined);
      jest.spyOn(adminRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new BadRequestException('Could not insert the account'),
      );
    });

    it('should not found admin email', () => {
      const { sut, securityValidation } = makeSut();

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(undefined);
      expect(sut.loginAdmin(payload)).rejects.toThrow(
        new BadRequestException('Email not found'),
      );
    });

    it('should not return the accessToken', async () => {
      const { sut, securityValidation } = makeSut();
      const admin = new Admin();
      admin.password =
        '$2b$10$mX7sULyai8m44HCkU1EmPuNa/nKccgDNOwJvqnBriE3Gqc9Iy8123';
      admin.email = payload.email;
      admin.username = payload.username;
      admin.adminId = '8ceffe30-f44b-40c6-96a9-42909c80a3ee';
      jest.spyOn(securityValidation, 'adminExists').mockResolvedValue(admin);

      await expect(sut.loginAdmin(payload)).rejects.toThrow(
        new UnauthorizedException('Please check your login credentials'),
      );
    });

    it('should not found admin account', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(undefined);

      expect(sut.updateAdmin(payload, new Admin())).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });

    it('should return error messge email already in use', () => {
      const { sut, securityValidation } = makeSut();

      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      const admin2 = new Admin();
      admin2.password = 'password';
      admin2.email = 'joao@silva.com';
      admin2.username = payload.username;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin2);

      expect(sut.updateAdmin(payload, admin)).rejects.toThrow(
        new BadRequestException('This email already in use'),
      );
    });

    it('should not update admin', async () => {
      const { adminRepositoryMock, sut, securityValidation } = makeSut();

      const updateResult = new UpdateResult();
      updateResult.affected = 0;
      const admin = new Admin();
      admin.password = 'password';
      admin.email = payload.email;
      admin.username = payload.username;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValueOnce(admin);

      jest.spyOn(adminRepositoryMock, 'update').mockResolvedValue(updateResult);

      await expect(sut.updateAdmin(payload, admin)).rejects.toThrow(
        new ConflictException('Could not update account'),
      );
    });

    it('should not authoize to create admin', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(Promise.resolve(undefined));

      expect(sut.createAdmin(payload, new Admin())).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });

    it('should not authoize to get admins', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(Promise.resolve(undefined));

      expect(sut.getAdmins(new Admin(), payload.email)).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });

    it('should not found admin account', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(undefined);

      expect(
        sut.deleteUser(new Admin(), '8ceffe30-f44b-40c6-96a9-42909c80a3ee'),
      ).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });

    it('should return error about user uuid is not valid', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(new Admin());

      expect(sut.deleteUser(new Admin(), 'not valid')).rejects.toThrow(
        new BadRequestException('It is not a valid user ID'),
      );
    });

    it('should admin delete an user', () => {
      const { sut, securityValidation, userRepositoryMock } = makeSut();
      const deleteResult = new DeleteResult();
      deleteResult.affected = 0;

      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(new Admin());
      jest.spyOn(userRepositoryMock, 'delete').mockResolvedValue(deleteResult);

      expect(
        sut.deleteUser(new Admin(), '8ceffe30-f44b-40c6-96a9-42909c80a3ee'),
      ).rejects.toThrow(new ConflictException('could not delete'));
    });

    it('should not find admin account', () => {
      const { sut, securityValidation } = makeSut();
      jest
        .spyOn(securityValidation, 'adminExists')
        .mockResolvedValue(undefined);

      expect(
        sut.getUsers(new Admin(), 1, 10, 'user@email.com'),
      ).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });
  });
});
