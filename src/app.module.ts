import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreatorModule } from './creator/creator.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleSeeder } from './scripts/seed-roles';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Validator, AuthTokenGuard } from './interceptors/validator';
import { PostModule } from './post/post.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/storycreate'),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    CreatorModule,
    UserModule,
    MediaModule,
    PostModule,
    NotificationModule,
    NotificationSettingsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RoleSeeder,
    Validator,
    AuthTokenGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: Validator,
    },
  ],
})
export class AppModule {}
