import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class EmailSignInDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ example: 'email@example.com' })
  user_email: string;

  @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
  @ApiProperty({ example: 'qwer!!234' })
  user_pwd: string;
}
