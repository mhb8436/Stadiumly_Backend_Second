import { IsEmail } from 'class-validator';

export class CheckUniqueEmailDto {
  @IsEmail()
  email: string;
}
