import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET'),
		})
	}

	async validate(payload: any) {
		const user = await this.userService.findOneById(payload.sub)

		if (user.secreteKeyJwtHash !== await bcrypt.compare(payload.secreteKeyJwtHash, user.secreteKeyJwtHash)) {

			return new UnauthorizedException('Invalid token')
		}
		return user
	}
}