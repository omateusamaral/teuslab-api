import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IValidateTypes } from '../types/validate-types.interface';
import { Repository } from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: IValidateTypes): Promise<Admin | User> {
    let user;

    switch (payload.role) {
      case 'admin':
        user = await this.adminRepository.findOne({ email: payload.email });
        break;
      case 'user':
        user = await this.userRepository.findOne({ email: payload.email });
        break;
      default:
        throw new UnauthorizedException();
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
