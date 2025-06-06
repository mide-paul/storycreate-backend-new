import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './community.schema';
import { PostService } from '../post/post.service';
import { Post, PostSchema } from '../post/post.schema';
import { CommunityPostController } from '../community-post/community-post.controller';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: Post.name, schema: PostSchema },
    ]),
    MediaModule,
    UserModule,
    PostModule,
  ],
  controllers: [CommunityController, CommunityPostController],
  providers: [CommunityService, PostService],
  exports: [CommunityService],
})
export class CommunityModule {}
