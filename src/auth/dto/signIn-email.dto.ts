import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class EmailSignInDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ example: 'email@example.com' })
  user_email: string;

  @Matches(
    /^(?!^[a-zA-Z]+$)(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$)[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,16}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합으로 8~16자여야 합니다.',
    },
  )
  @ApiProperty({ example: 'qwer!!234' })
  user_pwd: string;
}
