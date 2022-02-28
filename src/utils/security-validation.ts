import { User } from '../user/user.entity';
import { Admin } from '../admin/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SecurityValidation {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async userExists(email: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email=:email', {
        email,
      })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      return undefined;
    }
    return user;
  }
}
