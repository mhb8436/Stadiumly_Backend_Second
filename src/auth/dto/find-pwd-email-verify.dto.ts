import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class findIdEmailVerifyDto {
  @IsEmail()
  @ApiProperty({
    example: 'userEmail@email.com',
    description: '비번 찾기시 본인인증할, 유저가 가입한 이메일, ',
  })
  user_email: string;

  @IsString()
  @ApiProperty({
    example: 'ASGVD#%11',
    description: '이메일로 발송된 인증코드',
  })
  token: string;
}
