import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { v4 as uuidv4 } from 'uuid';

interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class FirebaseStorageService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async uploadFile(file: FileUpload, path: string = 'uploads'): Promise<string> {
    try {
      const bucket = this.firebaseAdmin.getStorage().bucket();
      const fileName = `${path}/${uuidv4()}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise<string>((resolve, reject) => {
        stream.on('error', (error: Error) => {
          reject(error);
        });

        // stream.on('finish', async () => {
        //   try {
        //     // Make the file public
        //     await fileUpload.makePublic();
        //     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        //     resolve(publicUrl);
        //   } catch (error: unknown) {
        //     if (error instanceof Error) {
        //       reject(error);
        //     } else {
        //       reject(new Error('An unknown error occurred while making the file public'));
        //     }
        //   }
        // });

        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucket = this.firebaseAdmin.getStorage().bucket();
      const fileName = fileUrl.split(`${bucket.name}/`)[1];
      if (fileName) {
        await bucket.file(fileName).delete();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}
