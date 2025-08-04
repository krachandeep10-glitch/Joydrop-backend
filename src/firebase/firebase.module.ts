import { Global, Module } from '@nestjs/common';
import { ConfigService } from '../config/configuration';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirestoreService } from './firestore.service';
import { FirestoreSetupService } from './firestore-setup.service';

@Global()
@Module({
  providers: [ConfigService, FirebaseAdminService, FirestoreService, FirestoreSetupService],
  exports: [FirebaseAdminService, FirestoreService, FirestoreSetupService],
})
export class FirebaseModule {}
