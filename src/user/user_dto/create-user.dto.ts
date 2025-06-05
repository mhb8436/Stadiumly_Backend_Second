import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserNomalDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'userEamil@example.com',
    description: '이메일 중복체크함, 필수값',
  })
  user_email: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{4,12}$/, {
    message: '닉네임은 영문 대소문자와 숫자로만 이루어진 4~12자여야 합니다.',
  })
  @ApiProperty({ example: 'joody', description: '유저 아이디, 유니크, 필수' })
  user_cus_id: string;

  @IsString()
  @Matches(
    /^(?!^[a-zA-Z]+$)(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$)[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,16}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합으로 8~16자여야 합니다.',
    },
  )
  @Transform(({ value }) => value.trim())
  @ApiProperty({ example: 'qwer123!@#', description: '비밀번호 필수' })
  user_pwd: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: '입력안하면 랜덤 닉네임',
    description:
      '유저가 입력안하면 자동생성, 필수값 아님 ' +
      ' ex) 형용사 + 응원하는 팀 마스코트명',
  })
  user_nick: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 1, description: '입력안하면 default 1, 필수값 아님' })
  user_grade: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 7,
    description: '필수 입력값 아님 입력안하면 응원하는 팀 없는 11',
  })
  user_like_staId: number;
}
