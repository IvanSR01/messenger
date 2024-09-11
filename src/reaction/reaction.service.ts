import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Reaction } from './reaction.entity'
import { Repository } from 'typeorm'
import { ReactionType } from './reaction-type.entity'
import { UserService } from 'src/user/user.service'
import { PostService } from 'src/post/post.service'
import { CreateReactionDto, CreateReactionTypeDto } from './dto/create.dto'

@Injectable()
export class ReactionService {
	constructor(
		@InjectRepository(Reaction)
		private readonly reactionRepository: Repository<Reaction>,
		@InjectRepository(ReactionType)
		private readonly reactionTypeRepository: Repository<ReactionType>,
		private readonly userService: UserService,
		private readonly postService: PostService
	) {}

	async createReacitonForPost(dto: CreateReactionDto) {
		const user = await this.userService.findOneById(dto.userId)

		if (!user) throw new NotFoundException('User not found')

		const post = await this.postService.findOne(dto.postId)

		if (!post) throw new NotFoundException('Post not found')

		return await this.reactionRepository.save({
			...dto,
			user,
			post
		})
	}

	async removeReactionForPost(id: number) {
		return await this.reactionRepository.delete(id)
	}

	async createReactionType(dto: CreateReactionTypeDto) {
		const re = await this.reactionTypeRepository.create(dto)
		return await this.reactionTypeRepository.save(re)
	}

	async removeReactionType(id: number) {
		return await this.reactionTypeRepository.delete(id)
	}
}
