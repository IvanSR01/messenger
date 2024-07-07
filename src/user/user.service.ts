import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) {}
	async findOneById(id: number) {
		return await this.userRepository.findOneBy({ id: id })
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
		const user = this.findOneByEmail(dto.email)
		if (!user) {
			return await this.userRepository.save(dto)
		}
		return new ConflictException('Email or username is already in use')
	}
	async updateUser(id: number, dto: Partial<User>) {
		return await this.userRepository.update({ id: id }, dto)
	}
	async deleteUser(id: number) {
		return await this.userRepository.delete({ id: id })
	}
}
