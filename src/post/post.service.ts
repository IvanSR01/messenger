import { ChannelService } from './../channel/channel.service';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { UserService } from 'src/user/user.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
  ) {}

  async findAllAndUpdateViews(channelId: number): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: {
        channel: { id: channelId },
      },
      relations: ['author', 'channel', 'reactions'],
			order: { sendTime: 'ASC' },
    });

    await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set({ view: () => 'view + 1' })
      .where('channelId = :channelId', { channelId })
      .execute();

    return posts;
  }

  async findOne(id: number): Promise<Post> {
    return await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'channel', 'reactions'],
    });
  }

  async createPost(dto: CreatePostDto) {
    const user = await this.userService.findOneById(dto.userId);
    const channel = await this.channelService.findOne(dto.channelId);

    if (!user || !channel) throw new NotFoundException('User or channel not found');
		const post = this.postRepository.create({
			...dto,
      author: user,
      channel,
		})
    return await this.postRepository.save(post);
  }

  async update(dto: UpdatePostDto) {
    const user = await this.userService.findOneById(dto.userId);

    if (!user) throw new NotFoundException('User not found');

    const post = await this.findOne(dto.id);

    if (!post) throw new NotFoundException('Post not found');

    if (dto.userId !== post.author.id && user.role === 'user') {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    return await this.postRepository.update({ id: dto.id }, dto);
  }

  async remove(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'channel', 'channel.author'], // Подгружаем авторов поста и канала
    });

    if (!post) throw new NotFoundException('Post not found');

    if (post.author.id !== userId && post.channel.author.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.postRepository.remove(post);
  }
}
