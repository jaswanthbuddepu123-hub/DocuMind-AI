require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'FRONTEND_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

const env = {};
const missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
  env[envVar] = process.env[envVar];
}

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = env;
