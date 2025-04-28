import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { Creator, CreatorSchema } from '../schemas/creator.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Person, PersonSchema } from '../schemas/person.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { UserModule } from '../user/user.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Creator.name, schema: CreatorSchema },
      { name: User.name, schema: UserSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.register({}),
    UserModule,
    MediaModule,
  ],
  controllers: [CreatorController],
  providers: [CreatorService],
  exports: [CreatorService],
})
export class CreatorModule {}
