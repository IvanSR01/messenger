import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CustomIoAdapter } from './message/message.adapter'
async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.enableShutdownHooks()
	app.enableCors({
		origin: '*',
		methods: ['GET', 'POST', 'PUt', 'DELETE'],
		credentials: true
	})
  app.useWebSocketAdapter(new CustomIoAdapter(app));
	app.use((req, res, next) => {
		console.log(`Incoming request: ${req.method} ${req.url}`)
		res.on('finish', () => {
			console.log(`Response status: ${res.statusCode}`)
		})
		next()
	})
	app.listen(4200)
}
bootstrap()
