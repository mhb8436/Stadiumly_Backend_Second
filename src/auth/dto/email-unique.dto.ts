import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckUniqueEmailDto {
  @IsEmail()
  @ApiProperty({
    example: 'email@example.com',
    description:
      '이메일 중복확인 & 사용가능한 이메일이면 바로 이메일로 인증코드 발송',
  })
  email: string;
}
