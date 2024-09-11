import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/:folder/:subFolder')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const { folder, subFolder } = req.params;
          const path = `./uploads/${folder}/${subFolder}`;
          // Проверяем, существует ли директория. Если нет, создаем ее.
          if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
          }

          callback(null, path);
        },
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, `${randomName}${extname(file.originalname)}.${file.mimetype.split('/')[1]}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
    @Param('subFolder') subFolder: string
  ) {
    return this.uploadService.handleFile(file);
  }
}
