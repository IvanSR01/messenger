import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { TypeValidateGitHubUser } from 'src/types/auth.types'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(
		private authService: AuthService,
		private configService: ConfigService
	) {
		super({
			clientID: configService.get<string>('GITHUB_CLIENT_ID'),
			clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
			callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
			scope: ['user:email'],
		})
	}

	async validate(profile: any, done: Function) {
		const { username, emails, photos } = profile
		const user: TypeValidateGitHubUser = {
			email: emails[0].value,
			username: username,
			picture: photos[0].value,
			id: profile.id,
		}
		done(null, user)
	}
}
