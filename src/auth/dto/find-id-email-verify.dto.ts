import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class findIdEmailVerifyDto {
  @IsEmail()
  @ApiProperty({
    example: 'userEmail@email.com',
    description:
      '로그인 안한 상태에서 이메일로 아이디 찾기 2단계, 유저가 인증 코드 받은 이메일 주소 수정할까봐 같이 요청함. 가입해둔 이메일 입력',
  })
  user_email: string;

  @IsString()
  @ApiProperty({
    example: 'ASGVD#%11',
    description: '이메일로 발송된 인증코드',
  })
  token: string;
}
