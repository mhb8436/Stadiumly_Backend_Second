import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class findPwdByEmailDto {
  @IsEmail()
  @ApiProperty({
    example: 'userEmail@email.com',
    description:
      '로그인 안한 상태에서 비밀번호 찾기 1단계, 이 이메일로 가입한 계정이 있는지 확인, 가입한 이메일 입력',
  })
  user_email: string;
}
