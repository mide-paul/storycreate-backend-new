import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Media } from "../schemas/media.schema";
import { ConfigService } from "@nestjs/config";
import { uploadImage, uploadToGCS } from "src/utils/uploader";
import md5 from "md5";

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
    private configService: ConfigService,
  ) {}

  async addMedia(file: Express.Multer.File) {
    try {
      console.log('Starting media upload for file:', file.originalname);
      const bucketName = this.configService.getOrThrow("GCP_STORAGE_BUCKET");
      const uploadResult = await uploadToGCS({
        bucketName,
        fileName: file.originalname,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
      });
      console.log('Upload result:', uploadResult);
      if (!uploadResult || !uploadResult.url) {
        throw new InternalServerErrorException('Failed to upload image');
      }
      return {
        url: uploadResult.url,
      };
    } catch (err) {
      console.error('Error in addMedia:', err);
      throw new InternalServerErrorException(err);
    }
  }

  async uploadMedia(path: string, file: Express.Multer.File) {
    try {
      file.originalname =
        md5(file.originalname) + "." + file.mimetype.split("/")[1];

      // check if the file is not an image
      if (!file.mimetype.startsWith("image")) {
        const bucketName = this.configService.getOrThrow("GCP_STORAGE_BUCKET");
        const uploadMedia = await uploadToGCS({
          bucketName,
          fileName: path + file.originalname,
          fileBuffer: file.buffer,
          contentType: file.mimetype,
        });

        return {
          url: uploadMedia.url,
          status: true,
        };
      }

      const uploadMedia = await uploadImage({
        data: file.buffer,
        directory: path,
      });

      // check if file is uploaded successfully
      if (!uploadMedia) {
        return {
          status: false,
        };
      }

      return {
        url: uploadMedia.secure_url,
        status: true,
      };
    } catch (err) {
      console.log('Error in uploadMedia:', err);
      return {
        status: false,
      };
    }
  }

  findAll() {
    return this.mediaModel.find().exec();
  }

  findOne(id: string) {
    return this.mediaModel.findById(id).exec();
  }

  remove(id: string) {
    return this.mediaModel.findByIdAndDelete(id).exec();
  }
}
