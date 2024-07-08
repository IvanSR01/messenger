import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    UserModule,
    ChatModule,
  ],
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
