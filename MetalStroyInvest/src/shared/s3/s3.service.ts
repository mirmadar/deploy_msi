import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const bucket = process.env.S3_BUCKET;

    if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'S3 configuration is missing. Please set S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET',
      );
    }

    this.bucket = bucket;
    // Для twcstorage публичный URL обычно: https://s3.twcstorage.ru/<bucket>/<key>
    this.publicBaseUrl = `${endpoint.replace(/\/+$/, '')}/${bucket}`;

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );

    const url = `${this.publicBaseUrl}/${encodeURIComponent(key)}`;

    return {
      key,
      url,
    };
  }
}

