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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userService: UserService,
    private myPageService: MypageService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  // 아이디로 로그인
  async loginUserID(user: AuthUser) {
    const payload = {
      sub: +user.user_id,
      username: user.user_nick,
      user_refreshtoken: user.user_refreshtoken || null,
      user_cus_id: user.user_cus_id,
    };

    // 탈퇴한 아이디 비번 확인해서 로그인 못하게 막아야함ㅋㅋㅋ
    const isStableUser = await this.userService.isExistUserId(user.user_cus_id);
    if (isStableUser?.user_status === 1) {
      throw new UnauthorizedException('탈퇴한 아이디입니다.');
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '14d',
    });

    await this.userService.updateRefreshToken(user.user_id, refreshToken);
    const userData = await this.userService;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      status: 'success',
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
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

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '1h',
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '14d',
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      await this.userService.updateRefreshToken(user.user_id, newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      throw new UnauthorizedException('Unknown error');
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
    user_cus_id: string,
    user_pwd: string,
  ): Promise<AuthUser | null> {
    const user = await this.userService.userFindByUserID({
      user_cus_id,
      user_pwd,
    });

    if (!user || !user.user_cus_id) return null;
    if (!user || !user.user_pwd) return null;

    const isMatch = await bcrypt.compare(user_pwd, user.user_pwd);

    if (!isMatch) return null;

    const { user_pwd: _, user_refreshtoken: __, ...safeUser } = user; // user_pwd 제거
    return safeUser as AuthUser; // 타입 보장
  }

  // 회원가입 버튼 눌렀을때
  async signUpWithEmail(userData: CreateUserNomalDto) {
    console.log('auth 회원가입 들어왔음 : ');

    const trimEmail = userData.user_email.toLowerCase().trim();
    const key = `verified-${trimEmail}`;
    const isVerifiEmail = await this.cacheManager.get<boolean>(key);

    console.log('isVerifiEmail : ', isVerifiEmail);

    if (!isVerifiEmail) {
      throw new UnauthorizedException(
        '이메일 인증시간이 초과했습니다 재인증이 필요합니다.',
      );
    }
    // 이제 진짜로 가입 시켜준다~
    await this.userService.signUpWithEmail(userData);
    // 이메일
    await this.cacheManager.del(key);
    await this.cacheManager.del(`token-${trimEmail}`);

    return { messase: '회원가입 성공', status: 'success' };
  }

  // 이메일 중복인지 체크
  async checkEmailUnique(email: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.userService.isExistEmail(email); // 리턴 T/F
    console.log('체크 이메일 유니크 안 : ');
    console.log('user : ', user);
    if (user?.user_email) {
      throw new UnauthorizedException('이미 사용 중인 이메일입니다.');
    } else if (user?.user_status === 1) {
      throw new UnauthorizedException('탈퇴한 이메일입니다.'); // 탈퇴한 유저도 이메일로 가입 불가
    }

    // 바로 토큰 발송
    // 여기서 토큰 저장 해야하나?
    await this.requestEmailVerification(email);
    return {
      message: '사용 가능한 이메일입니다. 발송된 인증코드를 확인해주세요',
      status: 'success',
    };
  }

  // 아이디 중복체크
  async checkUserIdUnique(userId: string) {
    const user = await this.userService.isExistUserId(userId);

    console.log('체크 유저 아이디 안 : ');

    if (user) {
      throw new UnauthorizedException('이미 사용중인 아이디입니다.');
    }

    return {
      message: '사용 가능한 아이디입니다.',
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
      await this.cacheManager.set<string>(key, code, 0); // TTL을 0으로 설정하여 만료되지 않게 함

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

  // 회원 가입시 이메일 토큰 검증
  async verifyCode(email: string, inputCode: string) {
    console.log('베리피 코드 들어옴 ');
    const trimEmail = email.toLowerCase().trim();
    const key = `token-${trimEmail}`;

    console.log('조회 키- 베리피 토큰안 :', key);

    try {
      const savedCode = await this.cacheManager.get<string>(key);
      console.log('세이브드 토큰 : ', savedCode);
      console.log('inputCode   : ', inputCode);

      if (!savedCode || savedCode !== inputCode.toUpperCase().trim()) {
        throw new UnauthorizedException(
          '인증코드가 일치하지 않습니다. 다시 시도해주세요',
        );
      }

      await this.cacheManager.del(key);
      await this.cacheManager.set<boolean>(`verified-${trimEmail}`, true, 0);
      return { message: '이메일 인증 성공', status: 'success' };
    } catch (error) {
      console.error('인증 코드 검증 중 에러 발생:', error);
      throw new UnauthorizedException('인증 코드 검증 중 오류가 발생했습니다.');
    }
  }

  // 로그인 안한상태에서 비밀번호 찾기 1
  async findPassword(user_email: string) {
    console.log('비밀번호 찾기 들어옴 : ');
    const user = await this.userService.isExistEmail(user_email);
    if (!user) {
      throw new UnauthorizedException(
        '해당 이메일로 가입한 사용자가 없습니다.',
      );
    } else if (user.user_status === 1) {
      throw new UnauthorizedException('탈퇴한 아이디입니다.');
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 캐시에 저장
    await this.cacheManager.set<string>(`find-pwd-${user_email}`, code, 0);
    console.log('비번 찾기 이메일 인증 토큰 : ', code);
    // 이 이메일로 가입한게 맞으면 인증 토큰 쏴주기
    await this.mailService.sendVerificationCode(user_email, code);

    return {
      message: '가입한 이메일로 인증코드를 발송했습니다.',
      status: 'success',
    };
  }

  // 비밀번호 찾기시 이메일 인증
  async findPwdEmailVerify(user_email: string, token: string) {
    console.log('비밀번호 찾기 이메일 인증 들어옴 : ');
    const cacheKey = `find-pwd-${user_email}`;
    const code = await this.cacheManager.get<string>(cacheKey);

    if (!code || code !== token.trim()) {
      throw new UnauthorizedException(
        '인증코드가 일치하지 않습니다. 다시 입력해주세요',
      );
    }

    // 인증 성공시 캐시 삭제
    await this.cacheManager.del(cacheKey);

    return {
      message: '이메일 본인인증 성공, 비밀번호를 변경해주세요',
      status: 'success',
    };
  }

  async updatePassword(user_email: string, new_pwd: string) {
    console.log('비밀번호 변경 들어옴 : ', user_email, new_pwd);

    const user = await this.userService.isExistEmail(user_email);

    if (!user || !user.user_cus_id) {
      throw new UnauthorizedException(
        '해당 이메일로 가입한 사용자가 없습니다.',
      );
    } else if (user.user_status === 1) {
      throw new UnauthorizedException('탈퇴한 아이디입니다.');
    }

    // 비밀번호 업데이트
    const response = await this.userService.updateUserPassword(
      user_email,
      new_pwd,
    );

    return {
      message: '비밀번호가 성공적으로 변경되었습니다.',
      status: 'success',
    };
  }

  // 로그인 안한상태에서 아이디 찾기
  async findUserId(user_email: string) {
    console.log('아이디 찾기 들어옴 : ', user_email);
    const user = await this.userService.isExistEmail(user_email);
    console.log('아이디 찾기  : ', user);

    if (!user || !user.user_cus_id) {
      throw new UnauthorizedException(
        '해당 아이디로 가입한 사용자가 없습니다.',
      );
    }
    if (user.user_status === 1) {
      throw new UnauthorizedException('탈퇴한 아이디입니다.');
    }

    // 가입한 유저가 있다면
    const userEmail = user.user_email;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await this.mailService.sendVerificationCode(userEmail!, code);

    await this.cacheManager.set<string>(
      `find-id-${userEmail}`,
      code,
      0,
      // TTL을 0으로 설정하여 만료되지 않게 함
    );

    console.log('아이디 찾기 인증코드 발송 : ', code);

    return {
      message: '가입한 이메일로 인증코드를 발송했습니다.',
      status: 'success',
    };
  }

  // 아이디 찾기시 이메일 인증
  async findIdEmailVerify(user_email: string, token: string) {
    console.log('아이디 찾기 이메일 인증 들어옴 : ');

    await this.cacheManager
      .get<string>(`find-id-${user_email}`)
      .then((code) => {
        console.log('유저가 입력한 토큰 : ', token);
        console.log('코드 : ', code);
        if (!code || code !== token.trim()) {
          throw new UnauthorizedException(
            '인증코드가 일치하지 않습니다. 다시 입력해주세요',
          );
        }
      });
    // 인증 성공시 아이디 알려주기
    const user = await this.userService.isExistEmail(user_email);

    if (!user || !user.user_cus_id) {
      throw new UnauthorizedException(
        '해당 이메일로 가입한 사용자가 없습니다.',
      );
    }

    await this.cacheManager.del(`find-id-${user_email}`);
    return {
      user_cus_id: user.user_cus_id,
      status: 'success',
      message: '이메일 본인인증 성공, 아이디를 알려줌',
    };
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
