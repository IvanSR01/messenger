import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { TypeLoginUser, TypeValidateGitHubUser } from 'src/types/auth.types'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { LoginUserDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async githubLogin(user: TypeValidateGitHubUser) {
		const existingUser = await this.userService.findOneByEmail(user.email)
		if (!existingUser) {
			const newUser = await this.userService.createUser({
				email: user.email,
				username: user.username,
				githubId: user.id,
				password: await bcrypt.hash(user.id, await bcrypt.genSalt(10)),
				secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
					user.id,
					user.email
				)
			})
			return this.loginUser(newUser as Partial<User>)
		}
		return this.loginUser(existingUser)
	}

	async login(dto: LoginUserDto) {
		const user = await this.userService.findOneByEmail(dto.email)
		if (!user) {
			throw new UnauthorizedException('User not found')
		}
		const isValid = await bcrypt.compare(dto.password, user.password)
		if (!isValid) {
			throw new UnauthorizedException('Invalid password')
		}
		return this.loginUser(user)
	}

	async registration(dto: CreateUserDto) {
		const user = await this.userService.createUser({
			...dto,
			password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)),
			secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
				dto.password,
				dto.email
			)
		})
		return this.loginUser(user as Partial<User>)
	}

	async updateTokens(refreshToken: string) {
		const payload = this.jwtService.decode(refreshToken)
		const user = await this.userService.findOneById(payload.sub)

		if (
			!user ||
			!(await bcrypt.compare(payload.secreteKeyJwtHash, user.secreteKeyJwtHash))
		) {
			throw new UnauthorizedException('Invalid token')
		}

		return this.generateToken(payload)
	}

	async loginUser(user: Partial<User>): TypeLoginUser {
		const payload = {
			username: user.username,
			sub: user.id,
			secreteKeyJwtHash: user.secreteKeyJwtHash
		}
		return this.generateToken(payload)
	}

	async generateToken(payload: any) {
		return {
			accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
			refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' })
		}
	}

	async createSecreteKeyJwtHash(id: string, email: string) {
		return bcrypt.hash(id + email, await bcrypt.genSalt(10))
	}
}
