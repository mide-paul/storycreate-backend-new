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
