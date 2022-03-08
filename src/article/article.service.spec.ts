import { Admin } from '../admin/admin.entity';
import { User } from '../user/user.entity';
import { SecurityValidation } from '../utils/security-validation';
import { InsertResult, Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('ArticleService', () => {
  const makeSut = () => {
    const articleRepositoryMock = new Repository<Article>();
    const adminRepositoryMock = new Repository<Admin>();
    const userRepositoryMock = new Repository<User>();
    const securityValidationMock = new SecurityValidation(
      adminRepositoryMock,
      userRepositoryMock,
    );

    const sut = new ArticleService(
      articleRepositoryMock,
      securityValidationMock,
    );

    return { sut, articleRepositoryMock, securityValidationMock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    title: 'Article Title',
    body: 'body',
    imageUrl: 'http://',
  };
  describe('Pass tests', () => {
    it('should insert the article', () => {
      const { securityValidationMock, articleRepositoryMock, sut } = makeSut();

      const insert = new InsertResult();
      jest
        .spyOn(securityValidationMock, 'adminExists')
        .mockResolvedValue(new Admin());

      jest.spyOn(articleRepositoryMock, 'insert').mockResolvedValue(insert);

      expect(sut.createArticle(new Admin(), payload)).resolves.toEqual(
        'Article created',
      );
    });
  });

  describe('Error tests', () => {
    it('should not found admin account', () => {
      const { securityValidationMock, sut } = makeSut();

      jest
        .spyOn(securityValidationMock, 'adminExists')
        .mockResolvedValue(undefined);

      expect(sut.createArticle(new Admin(), payload)).rejects.toThrow(
        new UnauthorizedException('You are not connected or not allowed'),
      );
    });

    it('should return message could not insert', () => {
      const { securityValidationMock, articleRepositoryMock, sut } = makeSut();

      jest
        .spyOn(securityValidationMock, 'adminExists')
        .mockResolvedValue(new Admin());

      jest.spyOn(articleRepositoryMock, 'insert').mockResolvedValue(undefined);

      expect(sut.createArticle(new Admin(), payload)).rejects.toThrow(
        new BadRequestException('Could not insert'),
      );
    });
  });
});
