# Firestore Database Setup Guide

## 1. Enable Firestore API
Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=joydrop-702e6

## 2. Create Firestore Database
1. Go to Firebase Console → Firestore Database
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location (us-central1 recommended)

## 3. Collection Structure

### Users Collection
- **Collection ID**: `users`
- **Document ID**: `{userId}` (auto-generated from Firebase Auth UID)

### Badges Subcollection
- **Collection Path**: `users/{userId}/badges`
- **Document ID**: `{badgeId}` (auto-generated)

## 4. Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Badges subcollection
      match /badges/{badgeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
