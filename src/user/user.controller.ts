import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller({ path: 'user', version: '1' })
export class UserController {}
