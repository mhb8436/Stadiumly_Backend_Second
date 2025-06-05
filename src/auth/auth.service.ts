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
      `verified-${userData.user_email.toLowerCase().trim()}`,
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
    console.log('체크 유니크 안 : ');
    console.log('user : ', user);
    if (user) {
      throw new UnauthorizedException('이미 사용 중인 이메일입니다.');
    }
    // 바로 토큰 발송
    await this.requestEmailVerification(email);
    return {
      message: '사용 가능한 이메일입니다. 발송된 인증코드를 확인해주세요',
      status: 'success',
    };
  }

  // 이메일 토큰 인증 관련 시작
  // 유저가 입력한 이메일에 토큰 발송
  async requestEmailVerification(email: string) {
    console.log('requestEmailVerification 입장 ');
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trimEmail = email.toLowerCase().trim();
    const key = `token-${trimEmail}`;

    console.log('인증 코드 캐시에 저장할거 : ', code);
    console.log('인증 코드 캐시 저장키 - 리퀘스트 안 : ', key);

    try {
      // 캐시에 저장
      // ...? 왜 TTl을 0으로 하면 오류안남?
      await this.cacheManager.set(key, code, 0); // TTL을 0으로 설정하여 만료되지 않게 함

      // 저장 직후 확인
      const confirm = await this.cacheManager.get<string>(key);
      console.log('confirm 저장하자마자 꺼냄 : ', confirm);

      if (!confirm) {
        throw new Error('캐시 저장 실패!');
      }

      await this.mailService.sendVerificationCode(trimEmail, code);
    } catch (error) {
      console.error('캐시 저장/조회 중 에러 발생:', error);
      throw new UnauthorizedException('인증 코드 생성 중 오류가 발생했습니다.');
    }
  }

  // 토큰 검증
  async verifyCode(email: string, inputCode: string) {
    console.log('베리피 코드 들어옴 ');
    const trimEmail = email.toLowerCase().trim();
    const key = `token-${trimEmail}`;

    console.log('조회 키- 베리피 토큰안 :', key);

    try {
      // 캐시 저장소의 모든 키 확인
      // const store = this.cacheManager.stores;
      // if ('keys' in store) {
      //   const allKeys = await store.keys();
      //   console.log('현재 캐시에 있는 모든 키들:', allKeys);
      // }

      const savedCode = await this.cacheManager.get<string>(key);
      console.log('세이브드 토큰 : ', savedCode);
      console.log('inputCode   : ', inputCode);

      if (!savedCode || savedCode !== inputCode.toUpperCase().trim()) {
        throw new UnauthorizedException(
          '인증코드가 일치하지 않습니다. 다시 시도해주세요',
        );
      }

      await this.cacheManager.del(key);
      await this.cacheManager.set(`verified-${trimEmail}`, true, 600);
      return { message: '이메일 인증 성공', status: 'success' };
    } catch (error) {
      console.error('인증 코드 검증 중 에러 발생:', error);
      throw new UnauthorizedException('인증 코드 검증 중 오류가 발생했습니다.');
    }
  }

  // 캐시 테스트
  async testCache(): Promise<string> {
    try {
      await this.cacheManager.set('test', 'hello-world', 60);
      const value = await this.cacheManager.get<string>('test');
      console.log('캐시에서 갖고옴 : ', value);
      return value ?? '캐시 못 읽음...;;';
    } catch (error) {
      console.log('캐시 못갖고옴', error);
      return '캐시 안됌';
    }
  }
}
