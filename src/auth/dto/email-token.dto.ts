import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CheckEmailTokenDto {
  @IsEmail()
  @ApiProperty({
    example: 'email@example.com',
    description: '토큰 발급때 입력한 이메일 변경 안됐는지 확인용',
  })
  email: string;

  @IsString()
  @ApiProperty({ example: '유저가 이메일로 받은 랜덤 문자열' })
  emailToken: string;
}
