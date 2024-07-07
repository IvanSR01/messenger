import { UseGuards, applyDecorators } from '@nestjs/common'
import { GithubAuthGuard } from '../guard/github-auth.guard'
import { JwtAuthGuard } from '../guard/jwt-auth.guard'

export function Auth(authType?: 'JWT' | 'GITHUB') {
	const isOAuth = authType === 'GITHUB'
	return applyDecorators(
		isOAuth ? UseGuards(GithubAuthGuard) : UseGuards(JwtAuthGuard)
	)
}
