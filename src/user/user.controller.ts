import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Put,
	Query
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { TypeUserData } from 'src/types/user.types'
import { UserData } from './decorators/user.decorator'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async findAll(@Query('search') search?: string) {
		return await this.userService.findAll(search)
	}

	@Get('info-profile')
	@Auth()
	async profile(@UserData('id') id: number) {
		return await this.userService.findOneById(id)
	}

	@Patch('toggle-contact')
	@Auth()
	async toggleContactUser(
		@UserData('id') myId: number,
		@Body('id') userId: number
	) {
		return await this.userService.toggleContactUser(myId, userId)
	}

	@Put('update-profile')
	@Auth()
	async updateProfile(@UserData('id') id: number, @Body() dto: TypeUserData) {
		return await this.userService.updateUser(id, dto)
	}

	@Delete('delete-profile')
	@Auth()
	async deleteProfile(@UserData('id') id: number) {
		return await this.userService.deleteUser(id)
	}
}
