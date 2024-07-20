import { Module } from '@nestjs/common';
import { PinnedController } from './pinned.controller';
import { PinnedService } from './pinned.service';

@Module({
  controllers: [PinnedController],
	providers: [PinnedService],
})
export class PinnedModule {}
