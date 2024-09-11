import { ChannelService } from './../channel/channel.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from './post.entity'
import { UserService } from 'src/user/user.service'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post) private readonly postRepository: Repository<Post>,
		private readonly channelService: ChannelService,
		private readonly userService: UserService
	) {}

	async findAllAndUpdateViews(channelId: number): Promise<Post[]> {
		// Находим все посты по каналу
		const posts = await this.postRepository.find({
			where: {
				channel: { id: channelId }
			},
			relations: {
				author: true,
				channel: true,
				reactions: true
			}
		})

		// Обновляем количество просмотров для всех постов в канале
		await this.postRepository
			.createQueryBuilder()
			.update(Post)
			.set({ view: () => 'view + 1' }) // Увеличиваем поле `views` на 1
			.where('channelId = :channelId', { channelId })
			.execute()

		return posts
	}

	async findOne(id: number): Promise<Post> {
		return await this.postRepository.findOne({
			where: { id: id },
			relations: {
				author: true,
				channel: true,
				reactions: true
			}
		})
	}

	async createPost(dto: CreatePostDto) {
		const user = await this.userService.findOneById(dto.userId)
		const channel = await this.channelService.findOne(dto.channelId)

		if (!user || !channel)
			throw new NotFoundException('User or channel not found')

		return await this.postRepository.save({
			...dto,
			author: user,
			channel
		})
	}

	async update(dto: UpdatePostDto) {
		const user = await this.userService.findOneById(dto.userId)

		if (!user) throw new NotFoundException('User not found')

		if (dto.userId !== user.id && user.role === 'user')
			throw new NotFoundException('You are not allowed to update this post')

		return await this.postRepository.update({ id: dto.id }, dto)
	}

	async remove(id: number, userId: number) {
		const post = await this.postRepository.findOneBy({ id })

		if (!post) throw new NotFoundException('Post not found')

		if (post.author.id !== userId && post.channel.author.id !== userId)
			throw new NotFoundException('You are not allowed to delete this post')

		await this.postRepository.remove(post)
	}
}
