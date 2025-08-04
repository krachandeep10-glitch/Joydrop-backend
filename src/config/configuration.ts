import { Injectable } from '@nestjs/common';
import { FirebaseAdminConfig } from './configuration.interface';

@Injectable()
export class ConfigService {
  private config: FirebaseAdminConfig;

  constructor() {
    this.config = {
      credential: {
        projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-project',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? 'demo@demo.com',
        privateKey: this.parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      },
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'demo-project.appspot.com',
    };
  }

  private parsePrivateKey(privateKey: string | undefined): string {
    // For development/testing, return a mock key if no real key is provided
    if (!privateKey || privateKey === 'privateKey') {
      console.warn('⚠️  No Firebase private key provided. Using mock key for development.');
      return this.getMockPrivateKey();
    }

    try {
      let parsedKey = privateKey;

      // Remove any quotes that might wrap the key
      parsedKey = parsedKey.replace(/^["']|["']$/g, '');

      // Handle escaped newlines
      if (parsedKey.includes('\\n')) {
        parsedKey = parsedKey.replace(/\\n/g, '\n');
      }

      // Remove any extra whitespace
      parsedKey = parsedKey.trim();

      // Check if it's already a properly formatted PEM key
      if (
        parsedKey.includes('-----BEGIN PRIVATE KEY-----') &&
        parsedKey.includes('-----END PRIVATE KEY-----')
      ) {
        return parsedKey;
      }

      // If it's just the base64 content without headers, wrap it
      if (!parsedKey.includes('-----BEGIN') && !parsedKey.includes('-----END')) {
        // Ensure the base64 content is properly formatted
        const base64Content = parsedKey.replace(/\s/g, '');
        const formattedContent = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content;

        return `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
      }

      return parsedKey;
    } catch (error) {
      console.error('❌ Error parsing Firebase private key:', error);
      console.warn('⚠️  Using mock key for development.');
      return this.getMockPrivateKey();
    }
  }

  private getMockPrivateKey(): string {
    // This is a mock private key for development purposes only
    // In production, you MUST provide a real Firebase service account key
    return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGGPy4eiYc5fQ5
K8xJ9mQ8tVoZ4xR2qJ3pL5nF7sK2vR8wE3mY6tL9xK5nQ7rP2sF4vX8yE9mN6tL
9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4v
X8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5
nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE
9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7r
P2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6
tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF
4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9x
K5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8
yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ
7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9m
N6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2
sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL
9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4v
X8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5
nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE
9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7r
P2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6
tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF
4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9x
K5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8
yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ
7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9m
N6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2
sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL
9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4v
X8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5
nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE9mN6tL9xK5nQ7rP2sF4vX8yE
-----END PRIVATE KEY-----`;
  }

  get firebaseServiceAccount(): FirebaseAdminConfig['credential'] {
    return this.config.credential;
  }

  get firebaseStorageBucket(): string {
    return this.config.storageBucket;
  }
}
