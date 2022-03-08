import { SecurityValidation } from '../utils/security-validation';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private securityValidation: SecurityValidation,
  ) {}

  async createArticle(admin: any, article: CreateArticleDto): Promise<string> {
    try {
      if (!(await this.securityValidation.adminExists(admin.email))) {
        throw new UnauthorizedException('You are not connected or not allowed');
      }

      const response = await this.articleRepository.insert({
        title: article.title,
        body: article.body,
        imageUrl: article.imageUrl,
        admin,
      });

      if (!response) {
        throw new BadRequestException('Could not insert');
      }

      return 'Article created';
    } catch (error) {
      throw error;
    }
  }
}
