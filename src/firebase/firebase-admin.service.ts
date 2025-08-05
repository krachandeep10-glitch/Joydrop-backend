import { Injectable, OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";
import { ConfigService } from "../config/configuration";

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private _auth: admin.auth.Auth | null = null;
  private _firestore: admin.firestore.Firestore | null = null;
  private _storage: admin.storage.Storage | null = null;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = this.configService.firebaseServiceAccount;

        console.log("🔥 Firebase Configuration:");
        console.log(
          "   Private Key:",
          serviceAccount.privateKey ? "Present" : "Missing",
        );

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: serviceAccount.projectId,
            clientEmail: serviceAccount.clientEmail,
            privateKey: serviceAccount.privateKey,
          }),
          storageBucket: this.configService.firebaseStorageBucket,
        });

        this._auth = admin.auth();
        this._firestore = admin.firestore();
        this._storage = admin.storage();
        this.isInitialized = true;

        console.log("✅ Firebase Admin initialized successfully");
      }
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      console.warn(
        "⚠️  Continuing without Firebase - some features may not work",
      );
    }
  }

  getAuth(): admin.auth.Auth {
    if (!this.isInitialized || !this._auth) {
      throw new Error(
        "Firebase not initialized. Please provide valid credentials.",
      );
    }
    return this._auth;
  }

  getFirestore(): admin.firestore.Firestore {
    if (!this.isInitialized || !this._firestore) {
      throw new Error(
        "Firebase not initialized. Please provide valid credentials.",
      );
    }
    return this._firestore;
  }

  getStorage(): admin.storage.Storage {
    if (!this.isInitialized || !this._storage) {
      throw new Error(
        "Firebase not initialized. Please provide valid credentials.",
      );
    }
    return this._storage;
  }

  getStorageBucket(): string {
    return this.configService.firebaseStorageBucket;
  }
}
