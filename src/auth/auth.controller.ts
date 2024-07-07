import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto, TokenUserDto } from './dto/auth.dto';
import { GithubAuthGuard } from './guard/github-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registration(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @UseGuards(GithubAuthGuard)
  @Get('github')
  async githubAuth() {
    // Этот маршрут перенаправляет на GitHub для аутентификации
  }

  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    const tokens = await this.authService.githubLogin(user);
    const redirectUrl = this.configService.get<string>('REDIRECT_URL');
    res.redirect(`${redirectUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() tokenUserDto: TokenUserDto) {
    return await this.authService.updateTokens(tokenUserDto.userId);
  }
}