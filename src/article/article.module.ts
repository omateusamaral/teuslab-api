import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityValidation } from '../utils/security-validation';
import { Admin } from '../admin/admin.entity';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { User } from '../user/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '5d',
        },
      }),
    }),
    TypeOrmModule.forFeature([Admin, Article, User]),
  ],

  controllers: [ArticleController],
  providers: [ArticleService, SecurityValidation],
  exports: [PassportModule],
})
export class ArticleModule {}
