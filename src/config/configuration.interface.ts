export interface DatabaseConfig {
  url: string;
}

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  apiPrefix: string;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
}

export interface FirebaseAdminConfig {
  credential: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  storageBucket: string;
}
