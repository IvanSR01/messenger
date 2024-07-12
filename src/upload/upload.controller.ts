import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { UploadService } from './upload.service'

class UploadDto {
	folder: string
}
@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}
	@Post()
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: (req, file, callback) => {
					const body = req.body as UploadDto
					const path = `/uploads/${body.folder}`
					callback(null, path)
				},
				filename: (req, file, callback) => {
					const randomName = Array(32)
						.fill(null)
						.map(() => Math.round(Math.random() * 16).toString(16))
						.join('')
					callback(null, `${randomName}${extname(file.originalname)}`)
				}
			})
		})
	)
	uploadFile(
		@Body() body: UploadDto,
		@UploadedFile() file: Express.Multer.File
	) {
		return this.uploadService.handleFile(file)
	}
}
