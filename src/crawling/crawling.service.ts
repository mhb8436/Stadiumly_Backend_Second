import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import axios from 'axios';
import * as cheerio from 'cheerio';

import * as puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma.service';

interface KBOGameData {
  homePitcher: string; // 홈 선수이름
  homeTeam: string; // 홈 팀이름
  homePitcherImg: string | undefined; // 홈 구장 선수 이미지
  awayPitcher: string; // 상대선수 이름
  awayTeam: string; // 상대선수 팀
  awayPitcherImg: string | undefined; // 상대선수 이미지
  broadimage: string | undefined; // 날씨 이미지
  stime: string; // 경기 시작시간
  gameID: string | undefined;
}

// https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/2025/67143.png
const cssHeader = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};
// 선발투수 크롤링
@Injectable()
export class CrawlingService {
  constructor(private readonly prisma: PrismaService) {}

  // url에서 바로 json 받아오기, param이 고정이라는 가정하에
  async getStartPitcherWithURL() {
    const paramDate = this.getParamDate();
    const URL = `https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList?leId=1&srId=0%2C1%2C3%2C4%2C5%2C6%2C7%2C8%2C9&date=${paramDate}`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await axios.get(URL, {
        headers,
      });
      console.log('json 받아오기 성공? : ');
      console.log(response.data);

      //@ts-ignore
      const jdata = response.data;
      // prisma 저장
      const datas = jdata.map((game) => {});
      return response.data;
    } catch (error) {
      console.error('크롤링 에러남 :', error);
      return null;
    }
  }

  // css 선택자로 크롤링하기
  // 배포시 주석해제 @@
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    name: 'bring-new-pitcher',
    timeZone: 'Asia/Seoul',
  })
  async crawlerStartPither(): Promise<any> {
    console.log('crawlerStartPither');
    const URL = 'https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx';

    const browser = await puppeteer.launch({
      headless: true,
      // 이 밑으로 배포시 주석해제
      // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      // args: [
      //   '--no-sandbox',
      //   '--disable-setuid-sandbox',
      //   '--disable-dev-shm-usage',
      //   '--disable-accelerated-2d-canvas',
      //   '--no-first-run',
      //   '--no-zygote',
      //   '--disable-gpu',
      // ],
    });

    try {
      const page = await browser.newPage();
      //페이지 로드 대기
      await page.goto(URL, { waitUntil: 'networkidle0' });

      // 브라우저 콘솔 로그를 Node.js 콘솔로 전달
      page.on('console', (msg) => console.log('Browser Console:', msg.text()));

      await page.waitForSelector('.today-game .game-cont', { timeout: 1000 });

      // html 태그로 내용 갖고오기
      const content = await page.content();
      const $ = cheerio.load(content);
      const games: KBOGameData[] = [];

      // 추가
      const gameHandles = await page.$$('.today-game .game-cont');
      for (const gameEl of gameHandles) {
        const gameElContent = await page.evaluate((el) => el.outerHTML, gameEl);

        // li 갯수 체크
        const game_cont_top_li_count = await page.evaluate((gameEl) => {
          const topElement = gameEl.querySelector('.top');
          const liElements = topElement?.querySelectorAll('li');
          return liElements?.length || 0;
        }, gameEl);

        await gameEl.click();

        await page.waitForFunction(
          () => {
            const element = document.querySelector('#gameCenterContents');
            const hasContent = element && element.innerHTML.trim().length > 0;

            return hasContent;
          },
          {
            timeout: 5000,
            polling: 100, // 100ms마다 체크
          },
        );

        // 내용이 채워진 후 DOM 가져오기
        const newContent = await page.evaluate(() => {
          const newElement = document.querySelector('#gameCenterContents');
          return newElement ? newElement.innerHTML : null; // innerHTML 반환
        });

        // cheerio로 HTML 파싱
        const $ = cheerio.load(newContent || '');

        // 로딩된 다음 데이터 긁어오기
        const gameData = await page.evaluate(
          (el, game_cont_top_li_count) => {
            const game = el as HTMLElement;

            const getText = (selector: string) => {
              const el = game.querySelector(selector);
              return el?.textContent?.trim().slice(1) ?? '';
            };

            const getImgAttr = (selector: string, attr: string) => {
              const el = game.querySelector(selector) as HTMLImageElement;
              return el?.getAttribute(attr) ?? '';
            };

            const getImgAttr2 = (selector: string, attr: string) => {
              const el = $(selector);
              return el.attr(attr) ?? '';
            };

            /*
            homePitcher: string; // 홈 선수이름
            homeTeam: string; // 홈 팀이름
            homePitcherImg: string | undefined; // 홈 구장 선수 이미지
            homeSecondImg: string | undefined; // 홈 구장 선수 예비 이미지
            awayPitcher: string; // 상대선수 이름
            awayTeam: string; // 상대선수 팀
            awayPitcherImg: string | undefined; // 상대선수 이미지
            awaySecondImg: string | undefined; // 상대 선수 예비이미지
            broadimage: string | undefined; // 날씨 이미지
            stime: string; // 경기 시작시간
          */

            console.log(
              `${getImgAttr2(
                '.tbl-pitcher tbody tr:nth-child(2) td.pitcher .player-img img.second',
                'onerror',
              )}`,
            );
            // top의 <li> 태그 갯수 센 다음에 2개면 시간따오는건 2번째 엘리먼트 선택하도록 예외처리

            return {
              homePitcher: getText('.team.home .today-pitcher p'),
              homeTeam: getImgAttr('.team.home .emb img', 'alt'),
              homePitcherImg: `https:${getImgAttr2('.tbl-pitcher tbody tr:nth-child(2) td.pitcher .player-img img:not([class])', 'src')}`,
              // homeSecondImg: `${getImgAttr2('.tbl-pitcher tbody tr:first-child td.pitcher .player-img img.second', 'onerror')}`,
              // getAttribute
              awayPitcher: getText('.team.away .today-pitcher p'),
              awayTeam: getImgAttr('.team.away .emb img', 'alt'),
              awayPitcherImg: `https:${getImgAttr2('.tbl-pitcher tbody tr:first-child td.pitcher .player-img img:not([class])', 'src')}`, // 클래스가 없는 img만 선택하도록함 테스트 필요
              broadimage:
                game_cont_top_li_count === 3
                  ? `https:${getImgAttr('.top li:nth-child(2) img', 'src')}`
                  : `https:${getImgAttr('.top li:nth-child(1) img', 'src')}`,
              stime:
                game_cont_top_li_count === 3
                  ? (game
                      .querySelector('.top li:nth-child(3)')
                      ?.textContent?.trim() ?? '')
                  : (game
                      .querySelector('.top li:nth-child(2)')
                      ?.textContent?.trim() ?? ''),
              gameID: game.getAttribute('g_id') ?? undefined,
            };
          },
          gameEl,
          game_cont_top_li_count,
        );

        games.push(gameData);

        // 대기
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // prisma에 저장
      for (let i = 0; i < games.length; i++) {
        await this.prisma.startPitcher.create({
          data: {
            pit_home_name: games[i].homePitcher,
            pit_home_team: games[i].homeTeam,
            pit_home_image: games[i].homePitcherImg ?? '',

            pit_away_name: games[i].awayPitcher,
            pit_away_team: games[i].awayTeam,
            pit_away_image: games[i].awayPitcherImg ?? '',

            pit_broad_image: games[i].broadimage ?? '',
            pit_game_time: games[i].stime,
            pit_game_id: games[i].gameID ?? '',
          },
        });
      }

      return games;
      // 이제 클릭 돌면서 선수 이미지 받아와
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
    }
  }

  // 그날그날 날짜 포메터
  getParamDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // deleteAll records
  // 매일 새벽 2시에 데이터 지우도록 함
  @Cron('0 2 * * *', {
    name: 'delete-old-pitcher',
    timeZone: 'Asia/Seoul',
  }) // 지금은 막아둘게영
  async deleteAllPitcher(): Promise<any> {
    try {
      await this.prisma.startPitcher.deleteMany();
    } catch (error) {
      console.error(error);
    }
  }

  // 카페테리아
}
