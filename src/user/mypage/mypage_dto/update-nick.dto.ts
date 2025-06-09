import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNickDto {
  @IsString()
  @ApiProperty({
    example: 'joody',
    description: '유저 닉네임, 입력안하면 랜덤생성',
  })
  user_nick: string;
}
