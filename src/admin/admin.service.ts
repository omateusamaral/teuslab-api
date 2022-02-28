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

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async adminExists(email: string): Promise<Admin | undefined> {
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.email=:email', {
        email,
      })
      .addSelect('admin.password')
      .getOne();

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

  async loginAdmin({ email, password }: AuthDto): Promise<string> {
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

  async updateAdmin(updateAdmindto: UpdateAdminDto, admin: any): Promise<void> {
    try {
      const adminLoggedObject = await this.adminExists(admin.email);

      if (!adminLoggedObject) {
        throw new UnauthorizedException(
          'You are not connected or not allowed to update',
        );
      }

      const adminObject = await this.adminExists(updateAdmindto.email);

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

  async getAdmins(email?: string): Promise<Admin[]> {
    try {
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
