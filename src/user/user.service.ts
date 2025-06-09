import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserNomalDto } from './user_dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { randomNickMaker } from './randomNick';
import { EmailSignInDto } from 'src/auth/dto/signIn-email.dto';
import { stdin } from 'process';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // 이메일로 회원가입
  async signUpWithEmail(signupform: CreateUserNomalDto) {
    console.log('유저 서비스 회원가입 들어옴 :');
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
    );
    const hashedPWD = await bcrypt.hash(signupform.user_pwd, salt);

    // 랜덤 형용사 + 구단 마스코트 이름
    const userNick = randomNickMaker(signupform.user_like_staId).trim();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.prisma.user.create({
      data: {
        user_cus_id: signupform.user_cus_id,
        user_email: signupform.user_email,
        user_like_staId: signupform.user_like_staId
          ? signupform.user_like_staId
          : 11, // 11이 응원하는 팀 없음
        user_pwd: hashedPWD,
        user_grade: 1,
        user_nick: signupform.user_nick ? signupform.user_nick : userNick,
      },
    });
    const response = { ...data, status: 'success', message: '회원가입 성공' };

    return response;
  }

  // 이메일로 가입한 회원 아이디로 로그인
  async userFindByUserID(emailSignInDto: EmailSignInDto) {
    const plainPWD = emailSignInDto.user_pwd;

    const user = await this.prisma.user.findUnique({
      where: {
        user_cus_id: emailSignInDto.user_cus_id,
      },
    });

    if (!user) {
      throw new HttpException(
        '사용자를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 비밀번호 일치하는지 확인
    const isMatch = await this.comparePassword(plainPWD, user.user_pwd || '');

    if (isMatch && user) {
      return user;
    }

    // 유저 못찾음
    return null;
  }

  async findUserById(userID: number) {
    return await this.prisma.user.findUnique({
      where: {
        user_id: userID,
      },
      select: {
        user_id: true,
        user_refreshtoken: true,
        user_nick: true,
      },
    });
  }

  // 이미 존재하는 회원인지 이메일로 확인 && 같은 이메일로 회원가입한적 있는지 확인
  async isExistEmail(user_email: string) {
    const exist = await this.prisma.user.findUnique({
      where: {
        user_email: user_email,
      },
      select: {
        user_status: true,
        user_email: true,
        user_cus_id: true,
      },
    });

    return exist;
  }

  async isExistUserId(user_cus_id: string) {
    const exist = await this.prisma.user.findUnique({
      where: {
        user_cus_id: user_cus_id,
      },
      select: {
        user_email: true,
        user_status: true,
        user_cus_id: true,
      },
    });

    return exist;
  }

  async deleteUserById(user_id: number) {}

  async updateUserPassword(user_email: string, new_pwd: string) {
    console.log('유저 서비스 비번 바꾸기 들어옴 : ', user_email, new_pwd);
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
    );
    const hashedPWD = await bcrypt.hash(new_pwd, salt);

    const result = this.prisma.user.update({
      where: {
        user_email: user_email,
      },
      data: {
        user_pwd: hashedPWD,
      },
    });

    return result;
  }

  // 비밀번호 일치하는지 확인
  async comparePassword(plainPWD: string, hashedPWD: string): Promise<boolean> {
    return bcrypt.compare(plainPWD, hashedPWD);
  }

  // 리프레시 토큰 발급 및 저장
  // 리프레시 토큰은 로그인할 때마다 새로 발급?
  async updateRefreshToken(userId: number, refreshToken: string | null) {
    let hashedToken: string | null = null;

    if (refreshToken) {
      const salt = parseInt(
        this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
      );
      hashedToken = await bcrypt.hash(refreshToken, salt);
    }

    return this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        user_refreshtoken: hashedToken,
      },
    });
  }

  async deactiveUser(user_cus_id: string) {
    const result = await this.prisma.user.update({
      where: {
        user_cus_id: user_cus_id,
      },
      data: {
        user_status: 1,
      },
    });

    return {
      ...result,
      status: 'success',
      message: '회원 탈퇴 성공',
    };
  }

  // 메인페이지 마스코트 정보 받아오기
  async getMascots() {}

  /*
    async updateRefreshToken(userId: number, refreshToken: string) {
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
    );
    const hashedToken = await bcrypt.hash(refreshToken, salt);

    return this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        user_refreshtoken: hashedToken,
      },
    });
  }*/
}
