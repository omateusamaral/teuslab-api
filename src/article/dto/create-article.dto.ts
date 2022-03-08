import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateArticleDto {
  @ApiProperty({ description: 'title', example: 'how to create a new article' })
  @IsNotEmpty({ message: 'title must be not empty' })
  @IsString({ message: 'title must bet a string' })
  title = '';

  @ApiProperty({ description: 'body', example: 'article body' })
  @IsNotEmpty({ message: 'body must be not empty' })
  @IsString({ message: 'body must bet a string' })
  body = '';

  @ApiProperty({
    description: 'imageUrl',
    example:
      'https://i.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U',
  })
  @IsNotEmpty({ message: 'imageUrl must be not empty' })
  @IsString({ message: 'imageUrl must bet a string' })
  imageUrl = '';
}
