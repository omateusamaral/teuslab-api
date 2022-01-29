import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AuthAdminDto } from './dto/auth-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async adminExists(email: string): Promise<Admin | undefined> {
    const admin = await this.adminRepository.findOne({
      where: {
        email,
      },
    });

    if (!admin) {
      return undefined;
    }
    return admin;
  }

  async createAdmin({
    email,
    password,
    username,
  }: CreateAdminDto): Promise<string> {
    try {
      if (await this.adminExists(email)) {
        throw new BadRequestException('Email already in use');
      }

      const adminEntityObject = plainToClass(Admin, {
        email: email,
        username: username,
        password: password,
      });
      const admin = await this.adminRepository.insert(adminEntityObject);

      if (!admin) {
        throw new BadRequestException('Could not insert the account');
      }

      return admin.raw[0].adminId;
    } catch (error) {
      throw error;
    }
  }

  async loginAdmin({ email, password }: AuthAdminDto): Promise<string> {
    try {
      const admin = await this.adminExists(email);
      if (!admin) {
        throw new BadRequestException('Email not found');
      }

      if (admin && (await bcrypt.compare(password, admin.password))) {
        const payload = {
          email,
          username: admin.username,
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
