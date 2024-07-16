import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class UploadService {
	handleFile(file: Express.Multer.File) {
		// Пример сохранения информации о файле, например, в базе данных
		// Эта логика может быть изменена в зависимости от ваших требований

		// Если необходимо, можно создать папку, если она не существует
		const directoryPath = path.dirname(file.path)
		if (!fs.existsSync(directoryPath)) {
			fs.mkdirSync(directoryPath, { recursive: true })
		}

		return {
			originalname: file.originalname,
			filename: file.filename,
			path: file.path,
			size: file.size,
			mimetype: file.mimetype
		}
	}
}
