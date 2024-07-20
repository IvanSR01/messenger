import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/json-transport'

@Injectable()
export class MailService {
	private readonly transporter: nodemailer.Transporter

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: 'imap.mail.ru',
			port: 993,
			secure: false,
			auth: {
				user: this.configService.get<string>('MAIL_USER'),
				pass: this.configService.get<string>('MAIL_PASS')
			}
		})
	}

	async sendMail(options: MailOptions) {
		return await this.transporter.sendMail(options)
	}
}
