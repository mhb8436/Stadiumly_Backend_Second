import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomNickMaker } from '../randomNick';
import { data } from 'cheerio/dist/commonjs/api/attributes';

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
        user_cus_id: true,
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
    let finalNick = newNickName;

    const likeTeam = (await this.prisma.user.findUnique({
      where: { user_id },
      select: {
        user_like_staId: true,
      },
    })) as { user_like_staId: number } | null;

    // 만약 닉네임을 입력하지 않았을 경우, 랜덤 닉네임 생성
    if (
      !newNickName ||
      newNickName.trim() === '' ||
      !likeTeam ||
      likeTeam.user_like_staId == 11
    ) {
      finalNick = randomNickMaker(11); // 11은 응원하는 팀 없음
    } else if (likeTeam.user_like_staId !== 11) {
      // 닉네임이 입력되었고, 응원하는 팀이 있을 경우
      finalNick = newNickName.trim();
    }

    const data = await this.prisma.user.update({
      where: {
        user_id: user_id,
      },
      data: {
        user_nick: finalNick,
      },
    });

    return {
      ...data,
      status: 'success',
      message: '닉네임 변경 성공',
    };
  }

  // 비밀번호 변경
  async changePWD(user_id: number, newPWD: string, currentPWD: string) {
    const user = await this.prisma.user.findUnique({
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
    // (async () => {
    //   const result = await bcrypt.compare(
    //     'qwer1234',
    //     '$2b$18$8ilcZve0ulwjuicyVSC58.EeJT1ocY.DhE5MLSmTV8.ULgw494/u6',
    //   );
    //   console.log(result); // true or false
    // })();

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
      this.config.get<string>('BCRYPT_SALT_ROUNDS') || '10',
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
