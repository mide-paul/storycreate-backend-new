import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Story, StorySchema } from '../stories/story.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
