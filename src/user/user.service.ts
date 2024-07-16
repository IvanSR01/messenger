import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) {}
	async findOneById(id: number) {
		console.log(id)
		return await this.userRepository.findOneBy({ id: id })
	}
	async findOneByOAuth(id: string) {
		return await this.userRepository.findOneBy({
			githubId: id
		})
	}
	async findOneByEmail(email: string) {
		return await this.userRepository.findOneBy({ email })
	}
	async findAll(search?: string) {
		return await this.userRepository.find({
			where: [{ username: search }, { fullName: search }]
		})
	}

	async createUser(dto: Partial<User>) {
		const user = await this.findOneByEmail(dto.email)
		if (!user) {
			return await this.userRepository.save(dto)
		}
		return new ConflictException('Email or username is already in use')
	}
	async updateUser(id: number, dto: Partial<User>) {
		return await this.userRepository.update({ id: id }, dto)
	}
	async toggleContactUser(myId: number, userId: number) {
		const myProfile = await this.findOneById(myId)
		const user = await this.findOneById(userId)
		if(!myProfile || !user) {
			new NotFoundException('User not found')
			return null
		}

		if (myProfile.contact.includes(user)) {
			myProfile.contact = myProfile.contact.filter((u) => u.id !== userId)
		} else {
			myProfile.contact.push(user)
		}
	
		return await this.userRepository.save(myProfile)
	}
	async deleteUser(id: number) {
		return await this.userRepository.delete({ id: id })
	}
}
