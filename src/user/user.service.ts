import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) { }
	async findOneById(id: string) {
		return await this.userRepository.findOneBy({ id })
	}
	async findOneByEmail(email: string) {
		return await this.userRepository.findOneBy({ email })
	}
	async createUser(dto: Partial<User>) {
		const user = this.findOneByEmail(dto.email)
		if (!user) {
			return await this.userRepository.save(dto)
		}
		return new ConflictException('Email or username is already in use')
	}
}
