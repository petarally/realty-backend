import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(file) {
  const fileKey = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://pub-${process.env.R2_PUB_KEY}.r2.dev/${fileKey}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw error;
  }
}

export async function deleteFromR2(imageUrl) {
  try {
    const fileKey = imageUrl.split("/").pop();
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted ${fileKey} from R2`);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error;
  }
}

export default uploadToR2;
