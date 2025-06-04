import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { MypageService } from 'src/user/mypage/mypage.service';
import { UserService } from 'src/user/user.service';

import { JwtService } from '@nestjs/jwt';
import { CreateUserNomalDto } from 'src/user/user_dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthUser } from 'src/types/auth-user.interface';
import { MailService } from 'src/mail/mail.service';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userService: UserService,
    private myPageService: MypageService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async loginEmail(user: AuthUser) {
    const payload = {
      sub: +user.user_id,
      username: user.user_nick,
      user_refreshtoken: user.user_refreshtoken || null,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '14d',
    });

    await this.userService.updateRefreshToken(user.user_id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(decoded.sub);

      if (!user || !user.user_refreshtoken) {
        throw new UnauthorizedException('No user or refresh token found');
      }

      const isMatch = await bcrypt.compare(
        refreshToken,
        user.user_refreshtoken,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Refresh token is SUCK');
      }

      const payload = { sub: user?.user_id, username: user?.user_nick };

      const newAccessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '14d',
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      await this.userService.updateRefreshToken(user.user_id, newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Token expired or Invalid');
    }
  }

  // // 이메일로 로그인시 검사
  // async signInWithEmail(emailSignInDto: EmailSignInDto) {
  //   // 비밀번호 제외한 data
  //   const userData = await this.userService.userFindByEmail(emailSignInDto);

  //   // 여기에 JWT 리턴해줘야 함
  //   const payload = { sub: userData?.user_id, username: userData?.user_nick };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async validateUser(
    user_email: string,
    user_pwd: string,
  ): Promise<AuthUser | null> {
    const user = await this.userService.userFindByEmail({
      user_email,
      user_pwd,
    });
    if (!user || !user.user_id) return null;
    if (!user || !user.user_pwd) return null;

    const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);
    if (!isMatch) return null;

    const { user_pwd: _, user_refreshtoken: __, ...safeUser } = user; // user_pwd 제거
    return safeUser as AuthUser; // 타입 보장
  }

  // 회원가입 버튼 눌렀을때
  async signUpWithEmail(userData: CreateUserNomalDto) {
    const isVerifiEmail = await this.cacheManager.get<boolean>(
      `${userData.user_email}`,
    );

    if (!isVerifiEmail) {
      throw new UnauthorizedException(
        '이메일 인증시간이 초과했습니다 재인증이 필요합니다.',
      );
    }
    // 이제 진짜로 가입 시켜준다~
    await this.userService.signUpWithEmail(userData);
    // 이메일
    await this.cacheManager.del(`${userData.user_email}`);

    return { messase: '회원가입 성공' };
  }

  // 이메일 중복인지 체크
  async checkEmailUnique(email: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.userService.isExistEmail(email); // 리턴 T/F
    if (user) {
      throw new UnauthorizedException('이미 사용 중인 이메일입니다.');
    }
    // 바로 토큰 발송해..?
    await this.requestEmailVerification(email);
    return { message: '사용 가능한 이메일입니다.' };
  }

  // 이메일 토큰 인증 관련 시작
  // 유저가 입력한 이메일에 토큰 발송
  async requestEmailVerification(email: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6자리 랜덤코드
    await this.cacheManager.set(`token-${email}`, code, 60 * 5); // 5분동안 캐시로 저장
    await this.mailService.sendVerificationCode(email, code);
    return { message: '인증 코드가 전송되었습니다.' };
  }

  // 토큰 검증
  async verifyCode(email: string, inputCode: string) {
    const savedCode = await this.cacheManager.get<string>(`token-${email}`);
    if (!savedCode || savedCode !== inputCode.toUpperCase()) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }
    await this.cacheManager.del(email); // 인증 코드 사용 후 삭제
    await this.cacheManager.set(email, true, 60 * 10); // 10분 동안 인증된 이메일로 저장
    return { message: '이메일 인증 성공' };
  }
}
