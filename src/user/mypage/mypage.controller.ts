import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MypageService } from './mypage.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AuthRequest } from 'src/types/auth-user.interface';
import { UpdateNickDto } from './mypage_dto/update-nick.dto';
import { UpdateTeamDto } from './mypage_dto/update-team.dto';
import { UpdatePwdDto } from './mypage_dto/update-pwd.dto';

@Controller('/user/mypage')
export class MypageController {
  constructor(private myPage: MypageService) {}

  @UseGuards(JwtAuthGuard) // jwt 토큰 확인
  @Get()
  async getMypageData(@Request() req: AuthRequest) {
    const userID = req.user.user_id;
    return this.myPage.getMypageData(userID);
  }

  // 닉네임 변경
  @UseGuards(JwtAuthGuard)
  @Post('nickChange')
  async updateNickName(
    @Request() req: AuthRequest,
    @Body() body: UpdateNickDto,
  ) {
    return this.myPage.updateNick(+req.user.user_id, body.user_nick);
  }

  // 로그인 중일때 비밀번호 변경
  @UseGuards(JwtAuthGuard)
  @Post('pwdChange')
  async updatePWD(@Request() req: AuthRequest, @Body() body: UpdatePwdDto) {
    return this.myPage.changePWD(
      +req.user.user_id,
      body.new_pwd,
      body.current_pwd,
    );
  }

  // 팀 변경
  @UseGuards(JwtAuthGuard)
  @Post('myteam')
  async updateMyTeam(@Request() req: AuthRequest, @Body() body: UpdateTeamDto) {
    console.log('바디 들어옴 ? :', body);
    return this.myPage.changeMyTeam(req.user.user_id, body.user_like_staId);
  }
}
