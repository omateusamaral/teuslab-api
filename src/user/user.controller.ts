import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthDto } from '../admin/dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

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
}
