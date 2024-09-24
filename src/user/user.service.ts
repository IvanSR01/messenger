import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) {}
	async findOneById(id: number): Promise<User> {
		return this.userRepository.findOne({
			where: { id },
			relations: ['contact', 'chats'] // Загрузить поле contact
		})
	}
	async findOneByOAuth(id: string) {
		return await this.userRepository.findOneBy({
			oauthId: id
		})
	}
	async findOneByUsername(username: string) {
		return await this.userRepository.findOneBy({ username })
	}
	async findOneByEmail(email: string) {
		return await this.userRepository.findOneBy({ email })
	}
	async findAll(search?: string) {
		return await this.userRepository.find({})
	}

	async areUsersInContacts(
		userId: number,
		contactId: number
	): Promise<boolean> {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['contact']
		})
		return user?.contact.some(contact => contact.id === contactId) ?? false
	}
	async createUser(dto: Partial<User>) {
		const user = await this.findOneByEmail(dto.email)
		if (!user) {
			return await this.userRepository.save(dto)
		}
		return new ConflictException('Email or username is already in use')
	}
	async updateUser(id: number, dto: Partial<User>) {
		// Находим пользователя с его контактами
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['contact']
		})

		if (dto.contact) {
			// Обновляем контакты, если они переданы
			user.contact = dto.contact
		}
		if (dto.password) {
			dto.password = await bcrypt.hash(dto.password, await bcrypt.genSalt(10))
		}


		return await this.userRepository.save({...dto})
	}

	async toggleContactUser(myId: number, userId: number) {
		const myProfile = await this.findOneById(myId)
		const user = await this.findOneById(userId)
		if (!myProfile || !user) {
			new NotFoundException('User not found')
			return null
		}

		if (myProfile.contact.includes(user)) {
			myProfile.contact = myProfile.contact.filter(u => u.id !== userId)
		} else {
			myProfile.contact.push(user)
		}

		return await this.userRepository.save(myProfile)
	}
	async deleteUser(id: number) {
		return await this.userRepository.delete({ id: id })
	}
}
