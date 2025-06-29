import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Person, PersonSchema } from '../schemas/person.schema';
import { Creator, CreatorSchema } from '../schemas/creator.schema';
import { Post, PostSchema } from '../post/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
