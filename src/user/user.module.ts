import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User,])],  // Удален UserRepository
  providers: [UserService, UserGateway],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
