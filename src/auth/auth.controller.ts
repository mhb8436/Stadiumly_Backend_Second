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
import { CheckUniqueUserIdDto } from './dto/userid-unique.dto';
import { findIdEmailVerifyDto } from './dto/find-id-email-verify.dto';
import { changePwdVerifyDto } from './dto/change-pwd-verify.dto';
import { findPwdByEmailDto } from './dto/find-pwd-by-emial.dto';
import { findIdByEmailDto } from './dto/find-id-by-email.dto';

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

  // 닉네임 중복 확인
  @Post('check-userid-unique')
  async checkUserIdUnique(@Body() body: CheckUniqueUserIdDto) {
    return this.authService.checkUserIdUnique(body.user_cus_id);
  }

  // 리프레시 토큰 검증
  @Post('refresh')
  async getNewRefreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  // 아이디로 로그인
  @UseGuards(LocalAuthGuard)
  @Post('userid-login')
  async signInWithUSerId(@Request() req: { user: AuthUser }) {
    return this.authService.loginUserID(req.user);
  }

  //비밀번호 찾기
  // 바디 값 수정
  @Post('find-pwd')
  async findPassword(@Body() body: findPwdByEmailDto) {
    return this.authService.findPassword(body.user_email);
  }

  // 비밀번호 찾기시 이메일 본인인증
  @Post('find-pwd-email-verify')
  async findPasswordEmailVerify(@Body() body: findIdEmailVerifyDto) {
    return this.authService.findPwdEmailVerify(body.user_email, body.token);
  }

  // 비밀번호 바꿔주기~
  @Post('find-pwd-update')
  async updatePassword(@Body() body: changePwdVerifyDto) {
    return this.authService.updatePassword(body.user_email, body.new_pwd);
  }

  // 로그인 안한상태에서
  // 이메일로 아이디 찾기
  @Post('find-id')
  async findUserId(@Body() body: findIdByEmailDto) {
    return this.authService.findUserId(body.user_email);
  }

  // 아이디 찾기시 이메일 본인인증
  @Post('find-id-email-verify')
  async findIdEmailVerify(@Body() body: findIdEmailVerifyDto) {
    return this.authService.findIdEmailVerify(body.user_email, body.token);
  }

  // 로그아웃
  // 로그아웃은 리프레시 토큰을 비워주는 것으로 처리
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: { user: AuthUser }) {
    return this.userService.updateRefreshToken(req.user.user_id, null);
  }

  // 탈퇴
  @UseGuards(JwtAuthGuard)
  @Post('delete-user')
  async deleteUser(@Request() req: { user: AuthUser }) {
    return this.userService.deactiveUser(req.user.user_cus_id);
  }

  @Get('test-cache')
  testCache(): Promise<string> {
    return this.authService.testCache();
  }
}
