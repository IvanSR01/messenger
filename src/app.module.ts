import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { User } from './user/user.entity'
@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: '1231231',
			database: 'messanger',
			entities: [User],
			synchronize: true
		}),
		AuthModule,
		UserModule
	]
})
export class AppModule {}
