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
import { UpdateUserDto } from './dto/update-user.dto';
import { encriptPassword } from '../utils/bcrypt-password';

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

  async updateUser(updateUserDto: UpdateUserDto, user: any): Promise<void> {
    try {
      const { password, userId } = await this.securityValidation.userExists(
        user.email,
      );

      if (!userId) {
        throw new UnauthorizedException('You are not connected or not allowed');
      }

      const { email } = await this.securityValidation.userExists(
        updateUserDto.email,
      );

      if (email.length) {
        throw new BadRequestException('This email already in use');
      }

      const newPassword = updateUserDto.password
        ? await encriptPassword(updateUserDto.password)
        : password;

      const result = await this.userRepository.update(
        {
          userId: userId,
        },
        {
          username: updateUserDto.username,
          email: updateUserDto.email,
          password: newPassword,
        },
      );

      if (result.affected === 0) {
        throw new BadRequestException('Could not update account');
      }
    } catch (error) {
      throw error;
    }
  }
}
