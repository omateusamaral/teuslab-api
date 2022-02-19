import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IValidateTypes } from '../types/validate-types.interface';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: IValidateTypes): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ email: payload.email });

    if (!admin) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
