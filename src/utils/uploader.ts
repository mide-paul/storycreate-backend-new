import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { BucketProps } from "src/core/struct";
import cloudinary, { UploadApiResponse } from "cloudinary";
import * as streamifier from "streamifier";
import { Storage } from "@google-cloud/storage";

async function upload({
  url,
  forcePathStyle,
  region,
  credentials,
  bucket,
}: BucketProps) {
  const s3Client = new S3Client({
    endpoint: url,
    forcePathStyle, // Configures to use subdomain/virtual calling format.
    region,
    credentials,
  });

  // Step 3: Define the parameters for the object you want to upload.
  const params: PutObjectCommandInput = {
    Bucket: bucket.Bucket, // The path to the directory you want to upload the object to, starting with your Space name.
    Key: bucket.Key, // Object key, referenced whenever you want to access this file later.
    Body: bucket.Body, // The object's contents. This variable is an object, not a string.
    ACL: bucket.ACL, // Defines ACL permissions, such as private or public.
    Metadata: bucket.Metadata,
    ContentType: bucket.Metadata["Content-Type"],
  };

  const uploadObject = async () => {
    try {
      const data = await s3Client.send(new PutObjectCommand(params));

      return {
        url: params.Bucket + "/" + params.Key,
        data,
      };
    } catch (err) {
      console.log("Error", err);
    }
  };

  const upload = await uploadObject();

  return upload;
}

async function uploadImage({
  data,
  directory,
  // onUploadSuccess,
  // onUploadFailure,
}: {
  data: Buffer;
  directory: string;
  onUploadSuccess?: (result: any) => void;
  onUploadFailure?: (error: any) => void;
}) {
  // const result: UploadApiResponse | null = null;

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadedMedia: UploadApiResponse | null = await new Promise(
    (resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { directory },
        (error, result) => {
          if (error) {
            return reject(null);
          }
          resolve(result as UploadApiResponse);
        },
      );
      // Convert the buffer to a stream and pipe it to Cloudinary
      streamifier.createReadStream(data).pipe(uploadStream);
    },
  );

  console.log(uploadedMedia);
  if (!uploadedMedia) {
    throw new Error('Failed to upload media');
  }
  return {
    secure_url: uploadedMedia.secure_url,
  };
}

// Updated function to upload to Google Cloud Storage without setting ACL (for uniform bucket-level access)
async function uploadToGCS({
  bucketName,
  fileName,
  fileBuffer,
  contentType,
}: {
  bucketName: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}) {
  try {
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Upload file
    await file.save(fileBuffer, {
      contentType,
      resumable: false,
    });

    // Do NOT call file.makePublic() due to uniform bucket-level access

    // Return URL with encoded fileName
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${encodeURIComponent(fileName)}`;
    return { url: publicUrl };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw error;
  }
}

export { upload, uploadImage, uploadToGCS };
