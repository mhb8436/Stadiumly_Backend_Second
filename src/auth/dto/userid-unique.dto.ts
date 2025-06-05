import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class CheckUniqueUserIdDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ example: '유저아이디 유니크 값 체크' })
  user_cus_id: string;
}
