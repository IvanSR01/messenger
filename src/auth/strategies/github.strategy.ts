import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github'
import { TypeValidateGitHubUser } from 'src/types/auth.types'
import { AuthService } from '../auth.service'

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
			scope: ['user:email']
		})
	}

	async validate(_: any, w: any, profile: any, done: Function) {
		const { username, emails, photos } = profile
		const user = {
			email: profile._json.email || '',
			username: username,
			picture: photos[0].value,
			id: profile.id
		}
		done(null, user)
	}
}
