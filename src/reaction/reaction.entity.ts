import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { ReactionType } from 'src/reaction/reaction-type.entity';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.reactions)
  user: User;

  @ManyToOne(() => Post, post => post.reactions)
  post: Post;

  @ManyToOne(() => ReactionType, reactionType => reactionType)
  reactionType: ReactionType;
}