import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AuthDto } from './dto/auth.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { encriptPassword } from '../utils/bcrypt-password';
import { SecurityValidation } from '../utils/security-validation';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private securityValidation: SecurityValidation,
  ) {}

  async createAdmin(
    { email, password, username }: CreateAdminDto,
    admin: any,
  ): Promise<string> {
    try {
      if (!(await this.securityValidation.adminExists(admin.email))) {
        throw new UnauthorizedException('You are not connected or not allowed');
      }

      if (await this.securityValidation.adminExists(email)) {
        throw new BadRequestException('Email already in use');
      }

      const adminEntityObject = plainToClass(Admin, {
        email: email,
        username: username,
        password: password,
      });
      const response = await this.adminRepository.insert(adminEntityObject);

      if (!response) {
        throw new BadRequestException('Could not insert the account');
      }

      return response.raw[0].adminId;
    } catch (error) {
      throw error;
    }
  }

  async loginAdmin({ email, password, role }: AuthDto): Promise<string> {
    try {
      const admin = await this.securityValidation.adminExists(email);
      if (!admin) {
        throw new BadRequestException('Email not found');
      }

      if (admin && (await bcrypt.compare(password, admin.password))) {
        const payload = {
          email,
          username: admin.username,
          role,
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

  async updateAdmin(updateAdmindto: UpdateAdminDto, admin: any): Promise<void> {
    try {
      const adminLoggedObject = await this.securityValidation.adminExists(
        admin.email,
      );

      if (!adminLoggedObject) {
        throw new UnauthorizedException('You are not connected or not allowed');
      }

      const adminObject = await this.securityValidation.adminExists(
        updateAdmindto.email,
      );

      if (adminObject.email !== admin.email) {
        throw new BadRequestException('This email already in use');
      }

      const newPassword = updateAdmindto.password
        ? await encriptPassword(updateAdmindto.password)
        : adminLoggedObject.password;

      const result = await this.adminRepository.update(
        {
          adminId: adminLoggedObject.adminId,
        },
        {
          username: updateAdmindto.username,
          email: updateAdmindto.email,
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

  async getAdmins(admin: any, email?: string): Promise<Admin[]> {
    try {
      if (!(await this.securityValidation.adminExists(admin.email))) {
        throw new UnauthorizedException('You are not connected or not allowed');
      }
      let admins = this.adminRepository.createQueryBuilder('admin');

      if (email) {
        admins = admins.where('admin.email like :email', {
          email: `%${email}%`,
        });
      }

      return await admins.getMany();
    } catch (error) {
      throw error;
    }
  }
}
