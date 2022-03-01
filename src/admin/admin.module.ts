import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { SecurityValidation } from '../utils/security-validation';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { JwtStrategy } from '../strategy/jwt.strategy';

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
    TypeOrmModule.forFeature([Admin, User]),
  ],

  controllers: [AdminController],
  providers: [AdminService, JwtStrategy, SecurityValidation],
  exports: [JwtModule, PassportModule],
})
export class AdminModule {}
