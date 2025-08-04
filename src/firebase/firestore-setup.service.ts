import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreSetupService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseAdmin.getFirestore();
  }

  /**
   * Initialize Firestore collections structure
   */
  async initializeCollections() {
    try {
      console.log('🚀 Initializing Firestore collections structure...');

      // Create users collection structure (no sample data)
      await this.firestore.collection('users').doc('_structure').set({
        description: 'Users collection structure',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✅ Users collection structure initialized');

      console.log('🎉 Firestore collections setup complete!');
      return { success: true, message: 'Collections structure initialized successfully' };
    } catch (error) {
      console.error('❌ Error initializing collections:', error);
      throw new Error(`Failed to initialize collections: ${error}`);
    }
  }

  /**
   * Create a user document with proper structure
   */
  async createUserDocument(userData: {
    uid: string;
    email: string;
    displayName: string;
    emailVerified?: boolean;
    photoURL?: string;
    points?: number;
    referredBy?: string;
    referralCount?: number;
    dob?: string;
    bio?: string;
    joydropReason?: string;
  }) {
    try {
      const userDoc = {
        ...userData,
        points: userData.points || 0,
        referralCount: userData.referralCount || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.firestore.collection('users').doc(userData.uid).set(userDoc);
      console.log(`✅ User document created: ${userData.uid}`);
      return userDoc;
    } catch (error) {
      console.error('❌ Error creating user document:', error);
      throw new Error(`Failed to create user document: ${error}`);
    }
  }



  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      const usersSnapshot = await this.firestore.collection('users').get();
      const userCount = usersSnapshot.size;

      return {
        users: userCount,
        collections: ['users'],
      };
    } catch (error) {
      console.error('❌ Error getting collection stats:', error);
      throw new Error(`Failed to get collection stats: ${error}`);
    }
  }


}
