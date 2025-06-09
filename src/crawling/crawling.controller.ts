import { Controller, Get, Post } from '@nestjs/common';
import { CrawlingService } from './crawling.service';

@Controller('crawling')
export class CrawlingController {
  constructor(private readonly crawlingService: CrawlingService) {}

  @Get('kbo-game-json')
  async getStartPitcherWithURL(): Promise<any> {
    return await this.crawlingService.getStartPitcherWithURL();
  }

  @Get('kbo-crawl')
  async getStartPitcherCrawl(): Promise<any> {
    return await this.crawlingService.crawlerStartPither();
  }

  @Post('delete-pitcher')
  async deleteForNextPitcher() {
    await this.crawlingService.deleteAllPitcher();
  }

  @Post('delete-all-pitcher')
  async deleteAllPitcher() {
    return this.crawlingService.deleteAllPitcher();
  }

  @Get('cafeteria-crawl')
  async getCafeteriaCrawl(): Promise<any> {}
}
