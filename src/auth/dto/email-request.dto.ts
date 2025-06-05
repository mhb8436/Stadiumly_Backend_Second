import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailRequestDto {
  @IsEmail()
  @ApiProperty({ example: 'email@example.com',description: '이메일' })
  email: string;
}
