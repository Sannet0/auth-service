import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../guards/jwt.guard';
import { CreateUserDto } from './dto/creating-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @UseGuards(JwtGuard)
  @Get('')
  async userInfo(@Req() req: any): Promise<{ id: string; login: string; }> {
    return await this.userService.userInfo(req);
  }

  @Post('registration')
  async registration(@Body() dto: CreateUserDto): Promise<{ jwt: string }> {
    return this.userService.registration(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<{ jwt: string }> {
    return this.userService.login(dto);
  }
}
