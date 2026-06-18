import { SettingsDataMap } from '@/server/settings/setting-schema';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream, unlink } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import settingsService from '@/server/settings/setting-service';
import prisma from '../prisma';
import { Media, StorageType } from '@prisma/client';
import APIError from '../api-error';
import { generateId } from '@/lib/utils';

export interface UploadOptions {
  fileName: string;
  file: File | Buffer;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  libraryMedia?: boolean;
  userId?: string;
}

export interface UploadResult {
  url: string;
  storageType: StorageType;
  media: Media;
}

export class UploadService {
  private static instance: UploadService;
  private storageSettings: SettingsDataMap['storage'] | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    const settings = await settingsService.getSetting('storage');
    this.storageSettings = settings;
    this.initialized = true;
  }

  async setStorageSettings(settings: SettingsDataMap['storage'] | null) {
    this.storageSettings = settings;
    this.initialized = true;
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.'));
    return `${nameWithoutExt}-${timestamp}-${generateId(4)}.${ext}`;
  }

  private async validateFile(file: File | Buffer, options: UploadOptions): Promise<void> {
    if (options.allowedTypes) {
      const fileType = file instanceof File ? file.type : '';
      if (!options.allowedTypes.includes(fileType)) {
        throw new APIError(
          `File type ${fileType} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
        );
      }
    }

    if (options.maxSize) {
      const fileSize = file instanceof File ? file.size : Buffer.byteLength(file);
      if (fileSize > options.maxSize) {
        throw new APIError(
          `File size ${fileSize} exceeds maximum allowed size of ${options.maxSize} bytes`,
        );
      }
    }
  }

  private async uploadToLocal(file: File | Buffer, options: UploadOptions): Promise<UploadResult> {
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uniqueFileName = this.generateUniqueFileName(options.fileName);
    const filePath = join(uploadDir, uniqueFileName);
    const writeStream = createWriteStream(filePath);

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await pipeline(Readable.from(buffer), writeStream);
    } else {
      await pipeline(Readable.from(file), writeStream);
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/media/${uniqueFileName}`;

    // Save to database
    const media = await prisma.media.create({
      data: {
        url,
        key: uniqueFileName,
        fileName: options.fileName,
        size: file instanceof File ? file.size : Buffer.byteLength(file),
        mimeType: file instanceof File ? file.type : 'application/octet-stream',
        storageType: 'local',
        libraryMedia: options.libraryMedia ?? false,
        userId: options.userId,
      },
    });

    return {
      url,
      storageType: 'local',
      media,
    };
  }

  private async uploadToS3(file: File | Buffer, options: UploadOptions): Promise<UploadResult> {
    if (
      !this.storageSettings?.s3Key ||
      !this.storageSettings?.s3Secret ||
      !this.storageSettings?.s3Region ||
      !this.storageSettings?.s3Bucket ||
      !this.storageSettings?.s3Endpoint
    ) {
      throw new APIError('S3 settings are incomplete');
    }

    const s3Client = new S3Client({
      region: this.storageSettings.s3Region,
      credentials: {
        accessKeyId: this.storageSettings.s3Key,
        secretAccessKey: this.storageSettings.s3Secret,
      },
      endpoint: this.storageSettings.s3Endpoint,
    });

    const uniqueFileName = this.generateUniqueFileName(options.fileName);
    const key = this.storageSettings.s3Folder
      ? `${this.storageSettings.s3Folder}/${uniqueFileName}`
      : uniqueFileName;

    const command = new PutObjectCommand({
      Bucket: this.storageSettings.s3Bucket,
      Key: key,
      Body: file instanceof File ? Buffer.from(await file.arrayBuffer()) : file,
      ContentType: file instanceof File ? file.type : undefined,
      ACL: 'public-read' as any,
      ContentDisposition: `attachment; filename="${uniqueFileName}"`,
    });

    await s3Client.send(command);

    const url = this.storageSettings.s3CustomDomain
      ? `${this.storageSettings.s3CustomDomain}/${key}`
      : `${this.storageSettings.s3Endpoint}/${this.storageSettings.s3Bucket}/${key}`;

    // Save to database
    const media = await prisma.media.create({
      data: {
        url,
        key,
        fileName: options.fileName,
        size: file instanceof File ? file.size : Buffer.byteLength(file),
        mimeType: file instanceof File ? file.type : 'application/octet-stream',
        storageType: 's3',
        libraryMedia: options.libraryMedia ?? false,
        userId: options.userId,
      },
    });

    return {
      url,
      storageType: 's3',
      media,
    };
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    await this.initialize();

    if (!this.storageSettings) {
      throw new APIError('Storage settings not configured');
    }

    await this.validateFile(options.file, options);

    switch (this.storageSettings.provider) {
      case 'local':
        return this.uploadToLocal(options.file, options);
      case 's3':
        return this.uploadToS3(options.file, options);
      default:
        throw new APIError(`Unsupported storage storageType: ${this.storageSettings.provider}`);
    }
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = join(process.cwd(), 'uploads', key);
    try {
      await new Promise<void>((resolve, reject) => {
        unlink(filePath, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    } catch (error) {
      console.error(`Error deleting local file ${filePath}:`, error);
      throw new APIError('Failed to delete local file');
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (
      !this.storageSettings?.s3Key ||
      !this.storageSettings?.s3Secret ||
      !this.storageSettings?.s3Region ||
      !this.storageSettings?.s3Bucket ||
      !this.storageSettings?.s3Endpoint
    ) {
      throw new APIError('S3 settings are incomplete');
    }

    const s3Client = new S3Client({
      region: this.storageSettings.s3Region,
      credentials: {
        accessKeyId: this.storageSettings.s3Key,
        secretAccessKey: this.storageSettings.s3Secret,
      },
      endpoint: this.storageSettings.s3Endpoint,
    });

    const command = new DeleteObjectCommand({
      Bucket: this.storageSettings.s3Bucket,
      Key: key,
    });

    try {
      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      throw new APIError('Failed to delete S3 file');
    }
  }

  async deleteMedia(key: string): Promise<void> {
    await this.initialize();

    if (!this.storageSettings) {
      throw new APIError('Storage settings not configured');
    }

    // Find the media record
    const mediaRecord = await prisma.media.findFirst({
      where: {
        key,
      },
    });

    if (!mediaRecord) {
      throw new APIError('Media not found');
    }

    // Delete from database
    await prisma.media.delete({
      where: {
        id: mediaRecord.id,
      },
    });

    // Delete from storage storageType
    switch (mediaRecord.storageType) {
      case 'local':
        await this.deleteFromLocal(mediaRecord.key);
        break;
      case 's3':
        await this.deleteFromS3(mediaRecord.key);
        break;
      default:
        throw new APIError(`Unsupported storage storageType: ${mediaRecord.storageType}`);
    }
  }

  async deleteMediaByUrl(url: string): Promise<void> {
    try {
      const mediaRecord = await prisma.media.findFirst({
        where: {
          url,
        },
      });

      if (!mediaRecord) {
        throw new APIError('Media not found');
      }

      await this.deleteMedia(mediaRecord.key);
    } catch {
      // ignore error
    }
  }

  async deleteMediaByMediaId(mediaId: string): Promise<void> {
    try {
      const mediaRecord = await prisma.media.findFirst({
        where: {
          id: mediaId,
        },
      });

      if (!mediaRecord) {
        throw new APIError('Media not found');
      }

      await this.deleteMedia(mediaRecord.key);
    } catch {
      // ignore error
    }
  }
}

export const uploadService = UploadService.getInstance();
