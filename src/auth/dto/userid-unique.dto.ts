import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class CheckUniqueUserIdDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]{4,12}$/, {
    message: '닉네임은 영문 대소문자와 숫자로만 이루어진 4~12자여야 합니다.',
  })
  @ApiProperty({ example: '유저아이디 유니크 값 체크' })
  user_cus_id: string;
}
