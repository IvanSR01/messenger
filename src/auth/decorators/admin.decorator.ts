import { SetMetadata } from '@nestjs/common';

export const AdminLevel = (level: 'admin-level-one' | 'admin-level-two') => SetMetadata('adminLevel', level);
