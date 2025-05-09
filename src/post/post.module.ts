import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MediaModule,
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
