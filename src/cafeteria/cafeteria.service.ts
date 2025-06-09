import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CafeteriaListDto } from './cafe_dto/cafeteria-list.dto';

@Injectable()
export class CafeteriaService {
  constructor(private readonly prisma: PrismaService) {}

  // 구내식당 리스트
  async getCafeList(
    stadiumId: string,
    location: string,
  ): Promise<CafeteriaListDto[]> {
    const staIdNum = parseInt(stadiumId); // string으로 받아오기 때문에 number로 치환해주기

    console.log('카페테리아 서비스 : ');
    console.log(staIdNum, location);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return (await this.prisma.cafeteria.findMany({
      where: {
        cafe_stadiumId: staIdNum,
        cafe_location: location,
      },
      select: {
        cafe_name: true,
        cafe_image: true,
        cafe_location: true,
        cafe_floor: true,
        cafe_category: true,
      },
    })) as CafeteriaListDto[];
  }
}
