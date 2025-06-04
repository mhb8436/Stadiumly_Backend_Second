import { Injectable } from '@nestjs/common';
import { GetStadiumDto } from './dto/stadium-list.dto';
import { PrismaService } from 'src/prisma.service';
import { GetStadiumDetailDto } from './dto/stadium-detailpage-data.dto';

@Injectable()
export class StadiumService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStadium(): Promise<GetStadiumDto[]> {
    // 이렇게 갈겨도 되는건가
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const data = await this.prisma.stadium.findMany({
      select: {
        sta_id: true,
        sta_name: true,
        sta_team: true,
        sta_lati: true,
        sta_long: true,
        sta_image: true,
      },
    });

    return data as GetStadiumDto[];
  }

  async getStadiumByTeamName(teamname: string): Promise<GetStadiumDetailDto> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const data = await this.prisma.startPitcher.findFirst({
      where: {
        pit_home_team: teamname,
      },
      select: {
        pit_broad_image: true,
        pit_game_time: true,
        pit_home_name: true,
        pit_home_team: true,
        pit_home_image: true,
        pit_away_name: true,
        pit_away_team: true,
        pit_away_image: true,
        pit_game_id: true,
      },
    });

    if (!data) {
      throw new Error(`No data found for team: ${teamname}`);
    }

    return data as GetStadiumDetailDto;
  }
}
