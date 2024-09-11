import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { CommentService } from './comment.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UserData } from 'src/user/decorators/user.decorator'

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Get('all/post/:id')
	async getPost(@Param('id') id: number) {
		return await this.commentService.findAll(id)
	}

	@Post('create-comment')
	@Auth()
	async createComment(@UserData('id') id: number, @Body() dto: any) {
		return await this.commentService.createComment({ ...dto, userId: id })
	}
}
