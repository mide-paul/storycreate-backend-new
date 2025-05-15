import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story, StorySchema } from './story.schema';
import { MediaModule } from '../media/media.module';
import { Comment, CommentSchema } from './comment.schema';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MediaModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService, CommentsService],
})
export class StoriesModule {}
