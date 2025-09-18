const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Get user count
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    // Get users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });
    
    console.log('👥 Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - ${user.role}`);
    });
    
    // Get system config
    const configs = await prisma.systemConfig.findMany({
      select: {
        key: true,
        value: true,
        type: true
      }
    });
    console.log('⚙️ System configurations:');
    configs.forEach(config => {
      console.log(`  - ${config.key}: ${config.value} (${config.type})`);
    });
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
