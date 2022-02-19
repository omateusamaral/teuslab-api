import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthAdminDto } from './dto/auth-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'express';
import { Admin } from './admin.entity';

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

  @Put()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiBody({ type: UpdateAdminDto })
  @ApiOperation({
    summary: 'Update admin account (must be authenticated as admin)',
  })
  async updateAdmin(
    @Body() updateAdmindto: UpdateAdminDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.adminService.updateAdmin(updateAdmindto, request.user);
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiQuery({ name: 'email', required: false })
  @ApiOperation({
    summary: 'list admins account (must be authenticated as admin)',
  })
  async getAdmins(@Query('email') email?: string): Promise<Admin[]> {
    return await this.adminService.getAdmins(email);
  }
}
