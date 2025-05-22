import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    Req,
    UploadedFile,
    UseGuards,
    UsePipes,
    ValidationPipe,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
  } from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
  import { UserService } from "./user.service";
  import { CreateUserDto } from "./dto/create-user.dto";
  import { UpdateUserDto } from "./dto/update-user.dto";
  import { AuthTokenGuard } from "src/interceptors/validator";
  import { Request } from "express";
  import { AuthUserDto } from './dto/auth-user.dto';
  import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
  
  @Controller("users")
  export class UserController {
    constructor(
      private readonly userService: UserService,
    ) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('id_upload'))
    create(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
            new FileTypeValidator({ fileType: 'image/jpeg|image/png|application/pdf' }),
          ],
        }),
      )
      id_upload: Express.Multer.File,
      @Body() createUserDto: any, // will update DTO later
    ) {
      return this.userService.create(createUserDto, id_upload);
    }
  
    @Post("login")
    login(@Body() loginDto: AuthUserDto) {
      return this.userService.login(loginDto);
    }
  
    @Get("profile")
    @UseInterceptors(AuthTokenGuard)
    async getProfile(
      @Req() req: Request & { user: { id: string } }
    ) {
      return await this.userService.getProfileByUserId(req.user.id);
    }
  
    @Patch("profile")
    @UseInterceptors(AuthTokenGuard)
    async updateProfile(
      @Req() req: Request & { user: { id: string } },
      @Body() updateUserProfileDto: UpdateUserProfileDto,
    ) {
      const updated = await this.userService.updateProfileByUserId(
        req.user.id,
        updateUserProfileDto,
      );
      return {
        message: 'Profile updated successfully',
        data: updated,
      };
    }
  
    @Get()
    @UseInterceptors(AuthTokenGuard)
    async getAll(@Req() req: Request) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      return await this.userService.getAll(token as string);
    }
  
    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.userService.findOne(id);
    }
  
    @Patch(":id")
    update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
      return this.userService.update(id, updateUserDto);
    }
  
    @Delete(":id")
    @UseInterceptors(AuthTokenGuard)
    async remove(@Req() req: Request, @Param("id") id: string) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      return await this.userService.remove(id);
    }
  
    @Get("user-payments")
    @UseInterceptors(AuthTokenGuard)
    async getUserPayments(@Req() request: Request) {
      const token = request.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error('No authorization token provided');
      }
      const user = await this.userService.getUserFromToken(token as string);
    }
  }
