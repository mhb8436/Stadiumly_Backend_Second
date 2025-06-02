import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MypageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // 마이페이지에 띄워줄 데이터
  async getMypageData(user_id: number) {
    const userData = await this.prisma.user.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        user_grade: true,
        user_like_staId: true,
        user_nick: true,
        user_email: true,
        stadium: {
          select: {
            sta_image: true,
            sta_team: true,
          },
        },
      },
    });

    return userData;
  }

  // 닉네임 변경
  async updateNick(user_id: number, newNickName: string) {
    return await this.prisma.user.update({
      where: {
        user_id: user_id,
      },
      data: {
        user_nick: newNickName,
      },
    });
  }

  // 비밀번호 변경
  async changePWD(user_id: number, newPWD: string, currentPWD: string) {
    const user = await this.prisma.user.findFirst({
      where: { user_id },
      select: { user_pwd: true },
    });
    console.log(' DB 저장되어있는 비번 : ');
    console.log(user?.user_pwd);
    if (!user || !user.user_pwd) {
      throw new BadRequestException(
        '사용자 정보가 없거나 비밀번호가 설정되어 있지 않습니다.',
      );
    }
    //??? 왜 자꾸 현제 비밀번호가 틀려따고하냐
    (async () => {
      const result = await bcrypt.compare(
        'qwer1234',
        '$2b$18$8ilcZve0ulwjuicyVSC58.EeJT1ocY.DhE5MLSmTV8.ULgw494/u6',
      );
      console.log(result); // true or false
    })();

    // 현재비밀번호와 입력한 (현재)비밀번호가 일치하는지
    const isCurrentMatch = await bcrypt.compare(
      currentPWD.trim(),
      user.user_pwd,
    );

    console.log('isCurrentMatch : ', isCurrentMatch);

    if (!isCurrentMatch) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다');
    }

    // 현재 비밀번호랑 새 비밀번호가 같은지 그냥 평문비교
    if (currentPWD === newPWD) {
      throw new BadRequestException(
        '기존 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.',
      );
    }
    const salt = parseInt(
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '18',
    );

    const hashedPWD = await bcrypt.hash(newPWD, salt);

    return await this.prisma.user.update({
      where: {
        user_id: user_id,
      },
      data: {
        user_pwd: hashedPWD,
      },
    });
  }

  // 내가 응원하는 팀 변경
  async changeMyTeam(user_id: number, newMyTeamID: number) {
    try {
      const result = await this.prisma.user.update({
        where: {
          user_id: user_id,
        },
        data: {
          user_like_staId: newMyTeamID,
        },
      });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
