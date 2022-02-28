import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AuthDto } from '../admin/dto/auth.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { SecurityValidation } from '../utils/security-validation';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private securityValidation: SecurityValidation,
  ) {}

  async createUser({
    email,
    password,
    username,
  }: CreateUserDto): Promise<void> {
    try {
      if (await this.securityValidation.userExists(email)) {
        throw new BadRequestException('Email already in use');
      }

      const user = plainToClass(User, {
        email: email,
        username: username,
        password: password,
      });

      if (!(await this.userRepository.insert(user))) {
        throw new BadRequestException('Could not insert the account');
      }
    } catch (error) {
      throw error;
    }
  }

  async loginUser({ email, password }: AuthDto): Promise<string> {
    try {
      const user = await this.securityValidation.userExists(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        const payload = {
          email,
          username: user.username,
        };
        const accessToken = this.jwtService.sign(payload);

        return accessToken;
      } else {
        throw new UnauthorizedException('Please check your login credentials');
      }
    } catch (error) {
      throw error;
    }
  }
}
