import { IsEmail, IsString } from 'class-validator';

export class CheckEmailTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  emailToken: string;
}
