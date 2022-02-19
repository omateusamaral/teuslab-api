import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IValidateTypes } from '../types/validate-types.interface';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: IValidateTypes): Promise<User> {
    const user = await this.UserRepository.findOne({ email: payload.email });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
