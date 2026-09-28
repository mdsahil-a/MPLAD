// Database configuration module
// Provides PostgreSQL connection interface if DATABASE_URL is configured,
// otherwise falls back cleanly to the mock/in-memory dataset.

import dotenv from 'dotenv';
dotenv.config();

export const isDbConfigured = Boolean(process.env.DATABASE_URL);

console.log(`[DB Config] Database mode: ${isDbConfigured ? 'PostgreSQL' : 'In-Memory Dummy Data'}`);

export const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mplad_prototype'
};
