import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import * as bcrypt from 'bcrypt'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UserService
	) {
		const secret = configService.get<string>('JWT_SECRET')
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret
		})
	}

	async validate(payload: any) {
		const user = await this.userService.findOneById(payload.sub)
		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		const isHashValid = await bcrypt.compare(
			payload.secreteKeyJwtHash,
			user.secreteKeyJwtHash
		)
		if (!isHashValid) {
			throw new UnauthorizedException('Invalid token')
		}
		return user
	}
}
