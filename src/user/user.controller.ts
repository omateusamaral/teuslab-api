import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthDto } from '../admin/dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({
    summary: 'Register a new user account',
  })
  async createUser(@Body() creatUserDto: CreateUserDto): Promise<void> {
    await this.userService.createUser(creatUserDto);
  }

  @Post('/login')
  @ApiBody({ type: AuthDto })
  @ApiOperation({
    summary: 'Sign in user account',
  })
  async loginAdmin(@Body() authDto: AuthDto) {
    return await this.userService.loginUser(authDto);
  }

  @Put()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({
    summary: "Update user's account (must be authenticated as user)",
  })
  async updateAdmin(
    @Body() updateUserdto: UpdateUserDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.userService.updateUser(updateUserdto, request.user);
  }

  @Delete()
  @UseGuards(AuthGuard())
  @ApiSecurity('Authorization')
  @ApiOperation({
    summary: "Delete user's account (must be authenticated as user)",
  })
  async deleteAdmin(@Req() request: Request): Promise<void> {
    await this.userService.deleteUser(request.user);
  }
}
