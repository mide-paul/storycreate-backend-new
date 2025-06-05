import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema, Comment, CommentSchema } from './post.schema';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    MediaModule,
    UserModule,
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    PostService,
  ],
})
export class PostModule {}
