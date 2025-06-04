import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserNomalDto } from './user_dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';
import { randomNickMaker } from './randomNick';
import { EmailSignInDto } from 'src/auth/dto/signIn-email.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // 이메일로 회원가입
  async signUpWithEmail(signupform: CreateUserNomalDto) {
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '18',
    );
    const hashedPWD = await bcrypt.hash(signupform.user_pwd, salt);

    // 랜덤 형용사 + 구단 마스코트 이름
    const userNick = randomNickMaker(signupform.user_like_staId);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.prisma.user.create({
      data: {
        user_email: signupform.user_email,
        user_like_staId: signupform.user_like_staId
          ? signupform.user_like_staId
          : 11, // 11이 응원하는 팀 없음
        user_pwd: hashedPWD,
        user_grade: 1,
        user_nick: signupform.user_nick ? signupform.user_nick : userNick,
      },
    });

    return data;
  }

  // 이메일로 가입한 회원 로그인
  async userFindByEmail(emailSignInDto: EmailSignInDto) {
    const plainPWD = emailSignInDto.user_pwd;

    const user = await this.prisma.user.findFirst({
      where: {
        user_email: emailSignInDto.user_email,
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
    return await this.prisma.user.findFirst({
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
    const exist = await this.prisma.user.findFirst({
      where: {
        user_email: user_email,
      },
    });

    return exist;
  }

  async deleteUserById(user_id: number) {}

  // 비밀번호 일치하는지 확인
  async comparePassword(plainPWD: string, hashedPWD: string): Promise<boolean> {
    return bcrypt.compare(plainPWD, hashedPWD);
  }

  // 리프레시 토큰 발급 및 저장
  async updateRefreshToken(userId: number, refreshToken: string) {
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '18',
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
  }
}
