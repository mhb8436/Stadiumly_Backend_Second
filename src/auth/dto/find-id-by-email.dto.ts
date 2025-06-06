import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class findIdByEmailDto {
  @IsEmail()
  @ApiProperty({
    example: 'userEmail@email.com',
    description: '로그인 안한 상태에서 아이디 찾기 1단계, 가입한 이메일 입력',
  })
  user_email: string;
}
