import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class changePwdVerifyDto {
  @IsEmail()
  @ApiProperty({
    example: 'userEmail@email.com',
    description: '비번 변경시 유저가 인증했던 이메일 ',
  })
  user_email: string;

  @IsString()
  @Matches(
    /^(?!^[a-zA-Z]+$)(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$)[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,16}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합으로 8~16자여야 합니다.',
    },
  )
  @ApiProperty({
    example: 'ASGVD#%11',
    description: '변경할 비밀번호 정규식 지켜서 입력 ',
  })
  new_pwd: string;
}
