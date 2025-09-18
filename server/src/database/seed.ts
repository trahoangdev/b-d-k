import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bigdatakeeper.com' },
    update: {},
    create: {
      email: 'admin@bigdatakeeper.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@bigdatakeeper.com' },
    update: {},
    create: {
      email: 'user@bigdatakeeper.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('✅ Test user created:', user.email);

  // Create root folder
  const rootFolder = await prisma.folder.upsert({
    where: { path: '/root' },
    update: {},
    create: {
      name: 'Root',
      path: '/root',
      description: 'Root folder for all files',
      userId: user.id,
    },
  });

  console.log('✅ Root folder created:', rootFolder.name);

  // Create Documents folder
  const documentsFolder = await prisma.folder.upsert({
    where: { path: '/root/Documents' },
    update: {},
    create: {
      name: 'Documents',
      path: '/root/Documents',
      description: 'Document files',
      parentId: rootFolder.id,
      userId: user.id,
    },
  });

  console.log('✅ Documents folder created:', documentsFolder.name);

  // Create Images folder
  const imagesFolder = await prisma.folder.upsert({
    where: { path: '/root/Images' },
    update: {},
    create: {
      name: 'Images',
      path: '/root/Images',
      description: 'Image files',
      parentId: rootFolder.id,
      userId: user.id,
    },
  });

  console.log('✅ Images folder created:', imagesFolder.name);

  // Create system configuration
  const configs = [
    {
      key: 'max_file_size',
      value: '2147483648', // 2GB
      type: 'number',
    },
    {
      key: 'allowed_file_types',
      value: 'pdf,doc,docx,xls,xlsx,ppt,pptx,zip,jpg,jpeg,png,gif,mp4,avi,mov',
      type: 'string',
    },
    {
      key: 'max_files_per_upload',
      value: '10',
      type: 'number',
    },
    {
      key: 'storage_quota',
      value: '107374182400', // 100GB
      type: 'number',
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ System configuration created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
