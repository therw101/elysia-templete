// Environment validation utility
export class EnvValidator {
  private static requiredVars: string[] = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME'
  ];

  private static productionRequiredVars: string[] = [
    'JWT_SECRET',
    'DATABASE_URL',
    'FRONTEND_URL'
  ];

  static validate(): { isValid: boolean; missingVars: string[]; warnings: string[] } {
    const missingVars: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    // Additional production checks
    if (process.env.NODE_ENV === 'production') {
      for (const varName of this.productionRequiredVars) {
        if (!process.env[varName]) {
          missingVars.push(varName);
        }
      }

      // Production-specific warnings
      if (process.env.JWT_SECRET === 'your-secret-key' || 
          process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production-min-32-chars') {
        warnings.push('JWT_SECRET should be changed from default value in production');
      }

      if (process.env.DB_PASSWORD === 'password') {
        warnings.push('DB_PASSWORD should be changed from default value in production');
      }
    }

    // Development warnings
    if (process.env.NODE_ENV === 'development') {
      if (!process.env.DEBUG) {
        warnings.push('Consider setting DEBUG=true for development');
      }
    }

    return {
      isValid: missingVars.length === 0,
      missingVars,
      warnings
    };
  }

  static printStatus(): void {
    const { isValid, missingVars, warnings } = this.validate();

    console.log('\n🔧 Environment Configuration Status:');
    console.log('=====================================');

    if (isValid) {
      console.log('✅ All required environment variables are set');
    } else {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }

    console.log('\n📝 Current configuration:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   PORT: ${process.env.PORT || 'undefined'}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'undefined'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'undefined'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'undefined'}`);

    if (!isValid) {
      console.log('\n💡 To fix this:');
      console.log('   1. Copy env.example to .env: cp env.example .env');
      console.log('   2. Edit .env file with your actual values');
      console.log('   3. Restart the application');
    }

    console.log('=====================================\n');
  }
}

// Helper function to get environment variable with validation
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

// Helper function to get environment variable with default value
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Helper function to get boolean environment variable
export function getBoolEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Helper function to get number environment variable
export function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Warning: ${key} is not a valid number, using default value ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
} 