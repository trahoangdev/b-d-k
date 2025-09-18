import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Redis Client
export const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Connect to databases
export const connectDatabases = async () => {
  try {
    // Connect to PostgreSQL
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Connect to Redis
    await redis.connect();
    console.log('✅ Connected to Redis');

    // Handle Redis errors
    redis.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
export const disconnectDatabases = async () => {
  try {
    await prisma.$disconnect();
    await redis.disconnect();
    console.log('✅ Databases disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting databases:', error);
  }
};

// Health check
export const checkDatabaseHealth = async () => {
  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    return { status: 'healthy', databases: ['postgresql', 'redis'] };
  } catch (error) {
    return { status: 'unhealthy', error: (error as Error).message };
  }
};
