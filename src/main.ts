import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as http from 'http';
import * as ws from 'ws';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  });

	
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    res.on('finish', () => {
      console.log(`Response status: ${res.statusCode}`);
    });
    next();
  });
	app.listen(4200)
}
bootstrap();
