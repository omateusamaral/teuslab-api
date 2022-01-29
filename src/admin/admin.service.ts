import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async adminExists(email: string): Promise<boolean> {
    const admin = await this.adminRepository.findOne({
      where: {
        email,
      },
    });

    if (!admin) {
      return false;
    }
    return true;
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
}
