import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { User } from "src/schemas/user.schema";
import { StreamingBlobPayloadInputTypes } from "@smithy/types";

interface UserTokenStruct {
  id: string;
  email: string;
  roles: string[];
}

interface SalaryStruct {
  min: number;
  max: number;
}

interface AdminValidationStruct {
  isValid: boolean;
  user: User;
}

interface UserStruct {
  name: string;
  email: string;
  phone: string;
}

interface BucketProps {
  url: string;
  forcePathStyle: boolean; // Configures to use subdomain/virtual calling format.
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucket: BucketInfo;
}

interface BucketInfo {
  Bucket: string; // The path to the directory you want to upload the object to, starting with your Space name.
  Key: string; // Object key, referenced whenever you want to access this file later.
  Body: StreamingBlobPayloadInputTypes; // The object's contents. This variable is an object, not a string.
  ACL: ObjectCannedACL; // Defines ACL permissions, such as private or public.
  Metadata: {
    "Content-Type": string;
    "x-amz-meta-my-key"?: string;
  };
}

export type {
  BucketProps,
  BucketInfo,
  UserTokenStruct,
  SalaryStruct,
  AdminValidationStruct,
  UserStruct,
};
