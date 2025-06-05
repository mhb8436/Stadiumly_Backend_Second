import { Module } from '@nestjs/common';
import { PlayerRecommandService } from './player-recommand.service';
import { PlayerRecommandController } from './player-recommand.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [PlayerRecommandController],
  providers: [PlayerRecommandService, PrismaService],
})
export class PlayerRecommandModule {}
