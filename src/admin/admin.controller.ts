import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post()
  @ApiBody({ type: CreateAdminDto })
  @ApiOperation({
    summary: 'Register a new admin account',
  })
  async createAdmin(@Body() creatAdminDto: CreateAdminDto): Promise<string> {
    return await this.adminService.createAdmin(creatAdminDto);
  }
}
