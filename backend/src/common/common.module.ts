import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [RedisService, CloudinaryService],
  exports: [RedisService, CloudinaryService],
})
export class CommonModule {}
