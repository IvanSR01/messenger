import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query
} from '@nestjs/common'
import { PostService } from './post.service'
import { UserData } from 'src/user/decorators/user.decorator'
import { CreatePostDto } from './dto/create-post.dto'
import { UpdatePostDto } from './dto/update-post.dto'

@Controller('posts')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get('all/channel/:id')
	async getAll(@Param('id') id: number) {
		return await this.postService.findAllAndUpdateViews(id)
	}

	@Get('one/:id')
	async getOne(@Query('id') id: number) {
		return await this.postService.findOne(id)
	}

	@Post('create')
	async createPost(@Body() dto: CreatePostDto, @UserData('id') id: number) {
		return await this.postService.createPost({ ...dto, userId: id })
	}

	@Put('update')
	async update(@Body() dto: UpdatePostDto, @UserData('id') id: number) {
		return await this.postService.update({ ...dto, userId: id })
	}

	@Delete('delete/:id')
	async remove(@Param('id') id: number, @UserData('id') userId: number) {
		return await this.postService.remove(id, userId)
	}
}
