import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserNomalDto } from 'src/user/user_dto/create-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt.guard';
import { UserService } from 'src/user/user.service';
import { AuthUser } from 'src/types/auth-user.interface';
import { CheckUniqueEmailDto } from './dto/email-unique.dto';
import { CheckEmailTokenDto } from './dto/email-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  // 이메일 중복확인 후 회원가입 버튼 눌렀을때
  @Post('email-signup')
  async signUpWithEmail(@Body() userformData: CreateUserNomalDto) {
    return this.authService.signUpWithEmail(userformData);
  }

  // 회원 가입페이지에서 이메일 중복확인
  @Post('check-email-unique')
  async checkEmailUnique(@Body() body: CheckUniqueEmailDto) {
    return this.authService.checkEmailUnique(body.email);
  }

  // 이메일 인증 코드 검증
  // 본인 이메일인지 인증하기
  @Post('email-token-check')
  async checkEmailToken(@Body() body: CheckEmailTokenDto) {
    return this.authService.verifyCode(body.email, body.emailToken);
  }

  @Post('refresh')
  async getNewRefreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(LocalAuthGuard)
  @Post('email-login')
  async signInWithEmial(@Request() req: { user: AuthUser }) {
    return this.authService.loginEmail(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: { user: AuthUser }) {
    return this.userService.updateRefreshToken(req.user.user_id, '');
  }

  @Get('test-cache')
  testCache(): Promise<string> {
    return this.authService.testCache();
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('email-login')
  // async signInWithEmial(@Request() req) {
  //   return this.authService.signInWithEmail(req.user);
  // }
}
