// import { IsString } from "class-validator";

import { IsNumber } from "class-validator";

export class CreateCallDto {
	// @IsString()
	@IsNumber()
	fromUserId: number

	toUserId:number[]

	name?: string | null

	callType: 'audio' | 'video'

	isGroup?: boolean

	@IsNumber()
	chatId: number
}