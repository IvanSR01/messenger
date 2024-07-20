import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
import { CloseSessionDto, LoginUserDto, TokenUserDto } from './dto/auth.dto'
import { UserData } from 'src/user/decorators/user.decorator'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() createUserDto: CreateUserDto) {
		return await this.authService.registration(createUserDto)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginUserDto: LoginUserDto) {
		return await this.authService.login(loginUserDto)
	}

	@Auth()
	@Post('get-code')
	@HttpCode(HttpStatus.OK)
	async getCode(@UserData('id') id: number) {
		return await this.authService.getCode(id)
	}

	@Auth()
	@Post('verify-user')
	@HttpCode(HttpStatus.OK)
	async verifyUser(@UserData('id') id: number) {
		return await this.authService.verifyUser(id)
	}

	@Auth('GITHUB')
	@Get('github')
	async githubAuth() {
		return
	}

	@Auth('GITHUB')
	@Get('github/callback')
	async githubAuthRedirect(@Req() req, @Res() res) {
		const user = req.user
		const { tokens, isVerified } = await this.authService.githubLogin(user)
		const redirectUrl = this.configService.get<string>('REDIRECT_URL')
		if (isVerified) res.redirect('http://localhost:3000/dashboard/main')
		res.redirect(
			`${'http://localhost:3000/auth/email'}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
		)
	}

	@Post('refresh-token')
	@HttpCode(HttpStatus.OK)
	async refreshToken(@Body() tokenUserDto: any) {
		return await this.authService.updateTokens(tokenUserDto.refreshToken)
	}

	@Post('close-session')
	@HttpCode(HttpStatus.OK)
	async closeSession(@Body() dto: CloseSessionDto) {
		return await this.authService.closeSession(dto)
	}
}
