import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { AuthDto } from './dto/auth.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'express';
import { Admin } from './admin.entity';
import { IGetUsers } from '../types/get-users.interface';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/login')
  @ApiBody({ type: AuthDto })
  @ApiOperation({
    summary: 'Sign in admin account',
  })
  async loginAdmin(@Body() authDto: AuthDto) {
    return await this.adminService.loginAdmin(authDto);
  }
  @Post()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiBody({ type: CreateAdminDto })
  @ApiOperation({
    summary: 'Register a new admin account',
  })
  async createAdmin(
    @Body() creatAdminDto: CreateAdminDto,
    @Req() request: Request,
  ): Promise<string> {
    return await this.adminService.createAdmin(creatAdminDto, request.user);
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
  async getAdmins(
    @Req() request: Request,
    @Query('email') email?: string,
  ): Promise<Admin[]> {
    return await this.adminService.getAdmins(request.user, email);
  }

  @Delete('delete-user/:userId')
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiOperation({
    summary:
      'delete an user account given  an userId (must be authenticated as admin)',
  })
  async deleteUser(
    @Req() request: Request,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.adminService.deleteUser(request.user, userId);
  }

  @Get('get-users')
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiQuery({ name: 'email', required: false })
  @ApiOperation({
    summary: 'get all users (must be authenticated as admin)',
  })
  async getUsers(
    @Req() request: Request,
    @Query('page') page: number,
    @Query('usersPerPage') usersPerPage: number,
    @Query('email') email?: string,
  ): Promise<IGetUsers> {
    return await this.adminService.getUsers(
      request.user,
      page,
      usersPerPage,
      email,
    );
  }
}
