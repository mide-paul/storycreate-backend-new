import {
    Controller,
    Get,
    Post,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
  } from "@nestjs/common";
  import { MediaService } from "./media.service";
  import { FileInterceptor } from "@nestjs/platform-express";
  
  @Controller("media")
  export class MediaController {
    constructor(private readonly mediaService: MediaService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor("file"))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      return this.mediaService.addMedia(file);
    }
  
    @Get()
    findAll() {
      return this.mediaService.findAll();
    }
  
    @Get(":id")
    findOne(@Param("id") id: string) {
      return this.mediaService.findOne(id);
    }
  
    @Delete(":id")
    remove(@Param("id") id: string) {
      return this.mediaService.remove(id);
    }
  }
  