import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:4000',

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  apis: {
    googlePlaces: process.env.GOOGLE_PLACES_API_KEY || '',
    clearbit: process.env.CLEARBIT_API_KEY || '',
    hunterIo: process.env.HUNTER_IO_API_KEY || '',
    apollo: process.env.APOLLO_API_KEY || '',
    openai: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'noreply@trackd2d.com',
  },

  get isDev() {
    return this.env === 'development';
  },

  get isProd() {
    return this.env === 'production';
  },
};

export default config;
