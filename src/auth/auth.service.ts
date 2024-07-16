import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { TypeLoginUser, TypeValidateGitHubUser } from 'src/types/auth.types'
import { TypeUserData } from 'src/types/user.types'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { CloseSessionDto, LoginUserDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async githubLogin(user: TypeValidateGitHubUser) {
		const existingUser = await this.userService.findOneByOAuth(user.id)
		if (!existingUser) {
			const newUser = await this.userService.createUser({
				email: user.email || '',
				username: user.username,
				githubId: user.id,
				password: await bcrypt.hash(user.id, await bcrypt.genSalt(10)),
				secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
					user.id,
					user.email
				)
			})
			return this.validatePayload(newUser as Partial<User>)
		}
		return this.validatePayload(existingUser)
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
		return this.validatePayload(user)
	}

	async registration(dto: CreateUserDto) {
		const existingUser =
			(await this.userService.findOneByEmail(dto.email)) ||
			(await this.userService.findOneByUsername(dto.username))
		if(existingUser) throw new ConflictException('Email or username already exists')
		const user = await this.userService.createUser({
			...dto,
			password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)),
			secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
				dto.password,
				dto.email
			)
		})
		return this.validatePayload(user as TypeUserData)
	}

	async updateTokens(refreshToken: string) {
		const payload = this.jwtService.decode(refreshToken)
		const user = await this.userService.findOneById(payload.sub)
		const isValid = user.secreteKeyJwtHash === payload.secreteKeyJwtHash

		if (!user || !isValid) {
			throw new UnauthorizedException('Invalid token')
		}

		return this.generateToken(payload)
	}

	async closeSession(dto: CloseSessionDto) {
		const payload = this.jwtService.decode(dto.accessToken)
		const user = await this.userService.findOneById(payload.sub)
		const isValid = user.secreteKeyJwtHash === payload.secreteKeyJwtHash

		if (!user || !isValid) {
			throw new UnauthorizedException('Invalid token')
		}

		const newSecreteKeyJwtHash = await this.createSecreteKeyJwtHash(
			payload.sub,
			user.email
		)
		await this.userService.updateUser(user.id, {
			secreteKeyJwtHash: newSecreteKeyJwtHash
		})
		return dto.isAllSessions
			? null
			: this.generateToken({
					...payload,
					secreteKeyJwtHash: newSecreteKeyJwtHash
				})
	}

	async validatePayload(user: TypeUserData): TypeLoginUser {
		const payload = {
			username: user.username,
			sub: user.id,
			secreteKeyJwtHash: user.secreteKeyJwtHash
		}
		return this.generateToken(payload)
	}

	async generateToken(payload: JWTTokenPayload) {
		// Убедимся, что свойство exp отсутствует
		const { exp, ...restPayload } = payload
		return {
			accessToken: this.jwtService.sign(restPayload, { expiresIn: '1h' }),
			refreshToken: this.jwtService.sign(restPayload, { expiresIn: '30d' })
		}
	}

	async createSecreteKeyJwtHash(id: string, email: string) {
		return bcrypt.hash(id + email, await bcrypt.genSalt(10))
	}
}
