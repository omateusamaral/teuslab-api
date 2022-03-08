import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
@ApiTags('Article')
@Controller({ path: 'article', version: '1' })
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiBody({ type: CreateArticleDto })
  @ApiOperation({
    summary: 'Register a new article (must be authenticated as admin)',
  })
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @Req() request: Request,
  ): Promise<string> {
    return await this.articleService.createArticle(
      request.user,
      createArticleDto,
    );
  }
}
