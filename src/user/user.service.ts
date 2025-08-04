import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { FirestoreService } from '../firebase/firestore.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly firestoreService: FirestoreService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { email, password, displayName, username, dob, bio, joydropReason, referredBy } =
        createUserDto;

      // Create user in Firebase Auth
      const userRecord = await this.firebaseAdmin.getAuth().createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });

      const userData = {
        uid: userRecord.uid,
        email: userRecord.email || email,
        displayName: userRecord.displayName || displayName,
        emailVerified: userRecord.emailVerified,
        points: 500,
        referralCount: 0,
        dob: dob || '',
        bio: bio || '',
        joydropReason: joydropReason || '',
        referredBy: referredBy || '',
        photoURL: userRecord.photoURL || '',
        username: username || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save user data to Firestore
      await this.firestoreService.createUser(userData);

      return {
        statusCode: 201,
        status: 'success',
        message: 'User created successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          points: 500,
          referralCount: 0,
          username,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('email address is already in use') ||
          error.message.includes('EMAIL_EXISTS')
        ) {
          return {
            statusCode: 409,
            status: 'error',
            message: 'Email already exists',
            data: {},
          };
        }

        if (error.message.includes('INVALID_EMAIL')) {
          return {
            statusCode: 400,
            status: 'error',
            message: 'Invalid email format',
            data: {},
          };
        }

        if (error.message.includes('WEAK_PASSWORD')) {
          return {
            statusCode: 400,
            status: 'error',
            message: 'Password is too weak',
            data: {},
          };
        }
      }

      return {
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        data: {},
      };
    }
  }

  async getUserByUid(uid: string) {
    try {
      const userRecord = await this.firebaseAdmin.getAuth().getUser(uid);
      const firestoreUser = await this.firestoreService.findUserById(uid);

      return {
        statusCode: 200,
        status: 'success',
        data: {
          ...userRecord,
          ...(firestoreUser || {}),
        },
      };
    } catch (error) {
      return {
        statusCode: 404,
        status: 'error',
        message: 'User not found',
        data: {},
      };
    }
  }

  async updateUser(uid: string, updateData: Partial<CreateUserDto>) {
    try {
      // Update Firebase Auth user
      const updateRequest: any = {};
      if (updateData.displayName) updateRequest.displayName = updateData.displayName;
      if (updateData.email) updateRequest.email = updateData.email;

      if (Object.keys(updateRequest).length > 0) {
        await this.firebaseAdmin.getAuth().updateUser(uid, updateRequest);
      }

      // Update Firestore user data
      const firestoreUpdateData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      delete firestoreUpdateData.password; // Don't update password in Firestore

      await this.firestoreService.updateUser(uid, firestoreUpdateData);

      return {
        statusCode: 200,
        status: 'success',
        message: 'User updated successfully',
        data: { uid },
      };
    } catch (error) {
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to update user',
        data: {},
      };
    }
  }

  async deleteUser(uid: string) {
    try {
      await this.firebaseAdmin.getAuth().deleteUser(uid);
      await this.firestoreService.deleteUser(uid);

      return {
        statusCode: 200,
        status: 'success',
        message: 'User deleted successfully',
        data: { uid },
      };
    } catch (error) {
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to delete user',
        data: {},
      };
    }
  }
} 