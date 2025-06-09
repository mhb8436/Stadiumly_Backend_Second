import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'user_cus_id', passwordField: 'user_pwd' });
  }

  async validate(user_cus_id: string, user_pwd: string): Promise<any> {

    const user = await this.authService.validateUser(user_cus_id, user_pwd);

    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    return user;
  }
}
