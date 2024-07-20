import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Chat } from 'src/chat/chat.entity';

@Entity()
export class PinnedChat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.pinnedChats, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Chat, chat => chat.pinnedByUsers, { onDelete: 'CASCADE' })
    chat: Chat;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    pinnedAt: Date;
}
