# 🔥 Firestore Database Setup Guide

## 📋 Overview

This guide explains how to create and manage Firestore collections using your database schema. Firestore is a NoSQL database, so we use collections and documents instead of traditional tables and rows.

## 🏗️ Collection Structure

Based on your schema, here's the recommended Firestore structure:

### 1. Users Collection
```
Collection: users
Document ID: {userId} (Firebase Auth UID)
```

**Document Fields:**
- `displayName` (string) - Required
- `email` (string) - Required  
- `points` (number) - Default: 0
- `referralCount` (number) - Default: 0
- `referredBy` (string) - Optional
- `dob` (string) - Optional
- `bio` (string) - Optional
- `joydropReason` (string) - Optional
- `emailVerified` (boolean) - From Firebase Auth
- `photoURL` (string) - Optional, from Firebase Auth
- `createdAt` (timestamp) - Auto-generated
- `updatedAt` (timestamp) - Auto-generated

### 2. Badges Subcollection
```
Collection: users/{userId}/badges
Document ID: {badgeId} (auto-generated)
```

**Document Fields:**
- `badgeName` (string) - Required
- `awardedOn` (timestamp) - Auto-generated
- `description` (string) - Optional

## 🚀 Setup Steps

### Step 1: Enable Firestore API
1. Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=joydrop-702e6
2. Click "Enable API"

### Step 2: Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `joydrop-702e6`
3. Navigate to **Firestore Database**
4. Click **Create Database**
5. Choose **Start in test mode** (for development)
6. Select location: **us-central1** (recommended)

### Step 3: Set Security Rules
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

## 🔧 API Endpoints

### Initialize Collections
```bash
POST /firestore/initialize
```
Creates sample documents to establish collections.

### Get Collection Stats
```bash
GET /firestore/stats
```
Returns collection statistics.

### Validate User Document
```bash
POST /firestore/validate-user
Content-Type: application/json

{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "points": 0,
  "referralCount": 0
}
```

## 📊 Testing the Setup

### 1. Initialize Collections
```bash
curl -X POST http://localhost:3001/firestore/initialize
```

### 2. Register a User (Creates User Document)
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "dob": "1990-01-01",
    "bio": "Test bio",
    "joydropReason": "Testing the app",
    "referredBy": "REF123"
  }'
```

### 3. Check Collection Stats
```bash
curl http://localhost:3001/firestore/stats
```

## 🔍 Viewing Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `joydrop-702e6`
3. Navigate to **Firestore Database**
4. You'll see:
   - `users` collection
   - Individual user documents with UIDs
   - `badges` subcollections under each user

## 📝 Schema Validation

The backend automatically validates documents against your schema:

- **Required Fields**: `uid`, `email`, `displayName`
- **Optional Fields**: `points`, `referralCount`, `referredBy`, `dob`, `bio`, `joydropReason`
- **Auto-generated**: `createdAt`, `updatedAt`, `points` (default: 0), `referralCount` (default: 0)

## 🛡️ Security Best Practices

1. **Authentication Required**: All operations require Firebase Auth
2. **User Isolation**: Users can only access their own data
3. **Input Validation**: All data is validated before storage
4. **Type Safety**: TypeScript ensures data type consistency

## 🔄 Data Migration

If you need to migrate existing data:

1. Export data from old system
2. Transform to match Firestore schema
3. Use the validation endpoint to check data
4. Import using the registration endpoint

## 📈 Monitoring

- Use Firebase Console to monitor usage
- Check collection stats via API
- Monitor security rules in Firebase Console
- Set up alerts for unusual activity

## 🎯 Next Steps

1. **Enable Firestore API** in Google Cloud Console
2. **Create Firestore Database** in Firebase Console
3. **Test the setup** using the provided endpoints
4. **Deploy security rules** for production
5. **Monitor usage** and optimize as needed

---

**Need Help?** Check the Swagger documentation at `http://localhost:3001/api` for detailed API information. 