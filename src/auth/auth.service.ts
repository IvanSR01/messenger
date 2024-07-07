import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { TypeLoginUser, TypeValidateGitHubUser } from 'src/types/auth.types'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) { }
	async loginUser(user: Partial<User>): TypeLoginUser {
		const payload = { username: user.username, sub: user.id, secreteKeyJwtHash: user.secreteKeyJwtHash }
		return {
			accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
			refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' })
		}
	}
	async registration(dto: CreateUserDto) {
		const user = await this.userService.createUser({ ...dto, password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)), secreteKeyJwtHash: await this.createSecreteKeyJwtHash(dto.password, dto.email) })
		return this.loginUser(user as Partial<User>)
	} s
	async githubLogin(user: TypeValidateGitHubUser) {
		const existingUser = await this.userService.findOneByEmail(user.email)
		if (!existingUser) {
			const newUser = await this.userService.createUser({
				email: user.email,
				username: user.username,
				githubId: user.id,
				password: await bcrypt.hash(user.id, await bcrypt.genSalt(10)),
				secreteKeyJwtHash: await this.createSecreteKeyJwtHash(user.id, user.email)
			})
			return this.loginUser(newUser as Partial<User>)
		}
		return this.loginUser(existingUser)
	}
	async createSecreteKeyJwtHash(id: string, email: string) {
		return await bcrypt.hash({
			id, email
		}, await bcrypt.genSalt(10))
	}
}


