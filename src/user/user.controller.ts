import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserNomalDto } from './user_dto/create-user.dto';
import { EmailSignInDto } from 'src/auth/dto/signIn-email.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // // up이 회원 가입
  // @Post('email-signup')
  // async create(@Body() userFormData: CreateUserNomalDto) {
  //   return this.userService.signUpWithEmail(userFormData);
  // }

  // @Post('email-enter')
  // async signInWithEmail(@Body() emailSignInDto: EmailSignInDto) {
  //   return this.userService.userFindByEmail(emailSignInDto);
  // }

  // @Get()
  // async getUseryEmail(@Body() userEmail: string, @Body() teamID: string) {
  //   return this.myPage.userfindByEmail(userEmail, +teamID);
  // }

  @Post('delete/:id')
  async leaveMembership(@Param('id') user_id: string) {
    return this.userService.deleteUserById(+user_id);
  }

  @Get('mascots')
  async getMascots() {
    return this.userService.getMascots();
  }
}
