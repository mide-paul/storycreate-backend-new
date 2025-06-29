import { Module } from "@nestjs/common";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Media, MediaSchema } from "../schemas/media.schema";
import { User, UserSchema } from "../schemas/user.schema";
import { Person, PersonSchema } from "../schemas/person.schema"; 
import { Role, RoleSchema } from "../schemas/role.schema";
import { Creator, CreatorSchema } from '../schemas/creator.schema';
import { UserService } from "../user/user.service";
import { Post, PostSchema } from "../post/post.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: User.name, schema: UserSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Creator.name, schema: CreatorSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService, UserService],
  exports: [MediaService],
})
export class MediaModule {}
