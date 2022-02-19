import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateAdminDto {
  @ApiProperty({ description: 'username', example: 'admin' })
  @IsNotEmpty({ message: 'username must be not empty' })
  @IsString({ message: 'username must bet a string' })
  username = '';

  @ApiProperty({ description: 'email', example: 'admin@email.com' })
  @IsNotEmpty({ message: 'email must be not empty' })
  @IsString({ message: 'email must bet a string' })
  email = '';

  @ApiProperty({ description: 'password', example: 'password', minLength: 8 })
  @IsString({ message: 'password must bet a string' })
  password = '';
}
