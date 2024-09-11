import { PostService } from 'src/post/post.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Comment } from './comment.entity'
import { Repository } from 'typeorm'
import { UserService } from 'src/user/user.service'

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		private readonly userService: UserService,
		private readonly postService: PostService
	) {}

	async findAll(postId: number) {
		return await this.commentRepository.find({
			where: { post: { id: postId } }
		})
	}

	async createComment(dto: any) {
		const user = await this.userService.findOneById(dto.userId)

		if (!user) throw new NotFoundException('User not found')

		const post = await this.postService.findOne(dto.postId)

		if (!post) throw new NotFoundException('Post not found')

		return await this.commentRepository.save({
			...dto,
			user,
			post
		})
	}

	async remove(id: number, userId: number) {
		const comment = await this.commentRepository.findOneBy({ id })

		if (!comment) throw new NotFoundException('Comment not found')

		if (comment.user.id !== userId && comment.post.author.id !== userId)
			throw new NotFoundException('You are not allowed to delete this comment')

		await this.commentRepository.remove(comment)
	}
}
