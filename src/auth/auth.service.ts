import {
	ConflictException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import {
	TypeLoginUser,
	TypeValidateGitHubUser,
	TypeValidateGoogleUser
} from 'src/types/auth.types'
import { TypeUserData } from 'src/types/user.types'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { User } from 'src/user/user.entity'
import { UserService } from 'src/user/user.service'
import { CloseSessionDto, CreateGoogleDto, LoginUserDto } from './dto/auth.dto'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService
	) {}

	async githubLogin(user: TypeValidateGitHubUser) {
		const existingUser = await this.userService.findOneByOAuth(user.id)
		if (!existingUser) {
			const newUser = await this.userService.createUser({
				email: user.email || '',
				username: user.username,
				oauthId: user.id,
				password: await bcrypt.hash(user.id, await bcrypt.genSalt(10)),
				secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
					user.id,
					user.email
				), isVerified: true
			})
			return {
				tokens: await this.validatePayload(existingUser),
				isVerified: false
			}
		}
		return {
			tokens: await this.validatePayload(existingUser),
			isVerified: existingUser.isVerified
		}
	}
	async googleLogin(user: TypeValidateGoogleUser) {
		const existingUser = await this.userService.findOneByOAuth(user.id)
		if (!existingUser) {
			const newUser = await this.userService.createUser({
				email: user.email || '',
				username: `${user.firstName} ${user.lastName}`,
				oauthId: user.id,
				password: await bcrypt.hash(user.id, await bcrypt.genSalt(10)),
				secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
					user.id,
					user.email
				),
				isVerified: false
			})
			return {
				tokens: await this.validatePayload(newUser as TypeUserData),
				isVerified: false
			}
		}
		return {
			tokens: await this.validatePayload(existingUser),
			isVerified: existingUser.isVerified
		}
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
		return {
			tokens: await this.validatePayload(user),
			isVerified: true
		}
	}

	async registration(dto: CreateUserDto) {
		const oldUser = ((await this.userService.findOneByEmail(dto.email)) ||
			(await this.userService.findOneByUsername(dto.username))) as User
		if (oldUser)
			throw new ConflictException('Email or username is already in use')
		const user = await this.userService.createUser({
			...dto,
			password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)),
			secreteKeyJwtHash: await this.createSecreteKeyJwtHash(
				dto.password,
				dto.email
			),
			isVerified: true
		})
		return {
			tokens: await this.validatePayload(user as TypeUserData),
			isVerified: true
		}
	}

	async verifyUser(id: number) {
		const user = await this.userService.findOneById(id)
		if (!user) throw new UnauthorizedException('User not found')
		await this.userService.updateUser(user.id, { isVerified: true })
		return this.validatePayload(user)
	}

	async getCode(id: number) {
		const user = await this.userService.findOneById(id)
		if (!user) throw new UnauthorizedException('User not found')
		const code = this.genCode()
		this.mailService.sendMail({
			to: user.email,
			from: "'No Reply' <Yq7pU@example.com>",
			subject: 'Verify email',
			text: `Your code is ${code}`
		})
		return code
	}

	async updateTokens(refreshToken: string) {
		const payload = this.jwtService.decode(refreshToken)
		console.log(payload, refreshToken)
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

	private async generateToken(payload: JWTTokenPayload) {
		// Убедимся, что свойство exp отсутствует
		const { exp, ...restPayload } = payload
		return {
			accessToken: this.jwtService.sign(restPayload, { expiresIn: '1year' }),
			refreshToken: this.jwtService.sign(restPayload, { expiresIn: '30d' })
		}
	}

	private async createSecreteKeyJwtHash(id: string, email: string) {
		return bcrypt.hash(id + email, await bcrypt.genSalt(10))
	}
	private genCode() {
		return Math.floor(100000 + Math.random() * 900000)
	}
}
