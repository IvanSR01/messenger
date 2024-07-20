import { UseGuards, applyDecorators } from '@nestjs/common'
import { GithubAuthGuard } from '../guard/github-auth.guard'
import { JwtAuthGuard } from '../guard/jwt-auth.guard'
import { GoogleAuthGuard } from '../guard/google-auth.guard'

export function Auth(authType?: 'JWT' | 'GITHUB' | 'GOOGLE') {
	const authMethods = {
		JWT: JwtAuthGuard,
		GITHUB: GithubAuthGuard,
		GOOGLE: GoogleAuthGuard
	}

	return applyDecorators(
		authType ? UseGuards(authMethods[authType]) : UseGuards(JwtAuthGuard)
	)
}
