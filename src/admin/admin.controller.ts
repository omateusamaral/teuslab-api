import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthAdminDto } from './dto/auth-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/login')
  @ApiBody({ type: AuthAdminDto })
  @ApiOperation({
    summary: 'Sign in admin account',
  })
  async loginAdmin(@Body() authAdminDto: AuthAdminDto) {
    return await this.adminService.loginAdmin(authAdminDto);
  }
  @Post()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiBody({ type: CreateAdminDto })
  @ApiOperation({
    summary: 'Register a new admin account',
  })
  async createAdmin(@Body() creatAdminDto: CreateAdminDto): Promise<string> {
    return await this.adminService.createAdmin(creatAdminDto);
  }
}
