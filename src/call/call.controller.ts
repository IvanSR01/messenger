import { Controller, Get, Param } from '@nestjs/common'
import { CallService } from './call.service'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('call')
export class CallController {
	constructor(private readonly callService: CallService) {}

	@Auth()
	@Get('by-id/:id')
	async getById(@Param('id') id: number) {
		return await this.callService.findById(id)
	}
}
