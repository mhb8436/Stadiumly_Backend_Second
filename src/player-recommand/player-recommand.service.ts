import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlayerRecommandService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerRecommandList(staID: number): Promise<any> {
    const data = await this.prisma.playerRecommendation.findMany({
      where: {
        reco_stadiumId: staID,
      },
      select: {
        reco_add: true,
        reco_image: true,
        reco_name: true,
        reco_menu: true,
        reco_player: true,
        reco_tp: true,
        reco_stadiumId: true,
      },
    });

    return data;
  }
}
