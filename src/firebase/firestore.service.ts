import { Injectable } from "@nestjs/common";
import { FirebaseAdminService } from "./firebase-admin.service";
import * as admin from "firebase-admin";

@Injectable()
export class FirestoreService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseAdmin.getFirestore();
  }

  // Helper function to remove undefined values from an object
  private removeUndefinedValues(obj: any): any {
    const result = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  // Generic methods for any collection
  async create<T>(
    collection: string,
    data: T,
    customId?: string,
  ): Promise<{ id: string; data: T }> {
    try {
      const docRef = customId
        ? this.firestore.collection(collection).doc(customId)
        : this.firestore.collection(collection).doc();

      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const cleanData = this.removeUndefinedValues(data);
      const docData = {
        ...cleanData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await docRef.set(docData);

      return {
        id: docRef.id,
        data: data,
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw new Error(`Failed to create document: ${error}`);
    }
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    try {
      const doc = await this.firestore.collection(collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      console.error(`Error finding document by ID in ${collection}:`, error);
      throw new Error(`Failed to find document: ${error}`);
    }
  }

  async findOne<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    try {
      const snapshot = await this.firestore
        .collection(collection)
        .where(field, "==", value)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      console.error(`Error finding document in ${collection}:`, error);
      throw new Error(`Failed to find document: ${error}`);
    }
  }

  async findMany<T>(
    collection: string,
    filters?: {
      field: string;
      operator: admin.firestore.WhereFilterOp;
      value: any;
    }[],
    limit?: number,
    orderBy?: { field: string; direction: "asc" | "desc" },
  ): Promise<T[]> {
    try {
      let query: admin.firestore.Query = this.firestore.collection(collection);

      // Apply filters
      if (filters) {
        filters.forEach((filter) => {
          query = query.where(filter.field, filter.operator, filter.value);
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction);
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      throw new Error(`Failed to find documents: ${error}`);
    }
  }

  async update<T>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    try {
      const docRef = this.firestore.collection(collection).doc(id);

      const updateData = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.update(updateData);
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      await this.firestore.collection(collection).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting document in ${collection}:`, error);
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  // User-specific methods
  async createUser(userData: {
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
    return this.create("users", userData, userData.uid);
  }

  async findUsersByUsername(username: string) {
    const snapshot = await this.firestore
      .collection("users")
      .orderBy("username")
      .startAt(username)
      .endAt(username + "\uf8ff")
      .get();

    return snapshot.empty ? [] : snapshot.docs.map((doc) => doc.data());
  }

  async findUserByEmail(email: string) {
    return this.findOne("users", "email", email);
  }

  async findUserById(uid: string) {
    return this.findById("users", uid);
  }

  async updateUser(uid: string, userData: any) {
    return this.update("users", uid, userData);
  }

  async deleteUser(uid: string) {
    return this.delete("users", uid);
  }

  // Collection references for advanced queries
  getCollection(collectionName: string): admin.firestore.CollectionReference {
    return this.firestore.collection(collectionName);
  }

  // Batch operations
  batch(): admin.firestore.WriteBatch {
    return this.firestore.batch();
  }

  // Transaction support
  async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>,
  ): Promise<T> {
    return this.firestore.runTransaction(updateFunction);
  }
}
