import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

import { PresignUploadDto } from './dto/presign-upload.dto';

export interface PresignedUpload {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expiresIn: number;

  constructor(private readonly config: ConfigService) {
    // NOTE: requires real AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (or an attached IAM role) at
    // runtime — this environment has none configured, so presign() will construct a valid
    // request but signing/network calls will fail until credentials exist.
    this.s3 = new S3Client({ region: this.config.get<string>('AWS_REGION') ?? 'ap-south-1' });
    this.bucket = this.config.get<string>('S3_MEDIA_BUCKET') ?? 'fitness-media-dev';
    this.expiresIn = Number(this.config.get<string>('S3_PRESIGN_EXPIRES_SECONDS') ?? 300);
  }

  async presignMealImageUpload(userId: string, dto: PresignUploadDto): Promise<PresignedUpload> {
    const extension = dto.fileName.includes('.') ? dto.fileName.split('.').pop() : 'bin';
    const s3Key = `meal-images/${userId}/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: dto.contentType,
      ServerSideEncryption: 'aws:kms',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: this.expiresIn });

    return { uploadUrl, s3Key, expiresIn: this.expiresIn };
  }
}
