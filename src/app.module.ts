import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommunityModule } from './community/community.module';
import { StoriesModule } from './stories/stories.module';
import { CreatorModule } from './creator/creator.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleSeeder } from './scripts/seed-roles';
import { Story, StorySchema } from './stories/story.schema';
import { AuthTokenGuard } from './interceptors/validator';
import { PostModule } from './post/post.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { MessagesModule } from './messages/messages.module';
import { LibraryModule } from './library/library.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JobModule } from './job/job.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/storycreate'),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    CreatorModule,
    UserModule,
    MediaModule,
    PostModule,
    NotificationModule,
    NotificationSettingsModule,
    MessagesModule,
    StoriesModule,
    LibraryModule,
    DashboardModule,
    CommunityModule,
    JobModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RoleSeeder,
    AuthTokenGuard,
  ],
})
export class AppModule { }
