import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({
    summary: 'Register a new admin account',
  })
  async createAdmin(@Body() creatAdminDto: CreateUserDto): Promise<void> {
    await this.userService.createUser(creatAdminDto);
  }
}
