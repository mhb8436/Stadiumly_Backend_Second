import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Matches(
    /^(?!^[a-zA-Z]+$)(?!^[0-9]+$)(?!^[^a-zA-Z0-9]+$)[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,16}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합으로 8~16자여야 합니다.',
    },
  )
  user_pwd: string;

  @IsNumber()
  @IsOptional()
  user_like_staId: number;
}
