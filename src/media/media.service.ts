import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Media } from "../schemas/media.schema";
import { ConfigService } from "@nestjs/config";
import { upload, uploadImage } from "src/utils/uploader";
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
      const uploadMedia = await upload({
        url: this.configService.getOrThrow("DIGITALOCEAN_SPACES_ENDPOINT"),
        forcePathStyle: true,
        region: this.configService.getOrThrow("DIGITALOCEAN_SPACES_REGION"),
        credentials: {
          accessKeyId: this.configService.getOrThrow(
            "DIGITALOCEAN_SPACES_ACCESS_KEY_ID",
          ),
          secretAccessKey: this.configService.getOrThrow(
            "DIGITALOCEAN_SPACES_SECRET_ACCESS_KEY",
          ),
        },
        bucket: {
          Bucket: this.configService.getOrThrow("DIGITALOCEAN_SPACES_BUCKET"),
          Key: file.originalname,
          Body: file.buffer,
          ACL: "public-read",
          Metadata: {
            "Content-Type": file.mimetype,
          },
        },
      });

      return {
        url:
          this.configService.getOrThrow("DIGITALOCEAN_SPACES_CDN_URL") +
          uploadMedia?.url,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async uploadMedia(path: string, file: Express.Multer.File) {
    try {
      file.originalname =
        md5(file.originalname) + "." + file.mimetype.split("/")[1];

      // check if the file is not an image
      if (!file.mimetype.startsWith("image")) {
        const uploadMedia = await upload({
          url: this.configService.getOrThrow("DIGITALOCEAN_SPACES_ENDPOINT"),
          forcePathStyle: true,
          region: this.configService.getOrThrow("DIGITALOCEAN_SPACES_REGION"),
          credentials: {
            accessKeyId: this.configService.getOrThrow(
              "DIGITALOCEAN_SPACES_ACCESS_KEY_ID",
            ),
            secretAccessKey: this.configService.getOrThrow(
              "DIGITALOCEAN_SPACES_SECRET_ACCESS_KEY",
            ),
          },
          bucket: {
            Bucket: this.configService.getOrThrow("DIGITALOCEAN_SPACES_BUCKET"),
            Key: path + file.originalname,
            Body: file.buffer,
            ACL: "public-read",
            Metadata: {
              "Content-Type": file.mimetype,
            },
          },
        });

        return {
          url:
            this.configService.getOrThrow("DIGITALOCEAN_SPACES_CDN_URL") +
            uploadMedia?.url,
          status: true,
        };
      }

      const uploadMedia = await uploadImage({
        data: file.buffer,
        directory: path,
        onUploadSuccess(result) {
          return {
            url: result.secure_url,
            status: true,
          };
        },
        onUploadFailure() {
          return {
            status: false,
          };
        },
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
      console.log(err);
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
