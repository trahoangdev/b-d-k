# Big Data Keeper - Backend API

Backend API server for Big Data Keeper application built with Node.js, Express, TypeScript, PostgreSQL, MinIO, and Redis.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **File Management**: Upload, download, delete, and organize files
- **Folder Management**: Create, organize, and manage folder structures
- **File Storage**: MinIO integration for scalable file storage
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Security**: Helmet, CORS, rate limiting, input validation
- **Analytics**: Track file operations and user activity
- **API Documentation**: RESTful API with comprehensive endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Storage**: MinIO (S3-compatible)
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- MinIO Server

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/big_data_keeper?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="big-data-keeper"
MINIO_USE_SSL=false

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Server Configuration
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:8080"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── database/       # Database connection & seed
│   ├── types/          # TypeScript types
│   └── index.ts        # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Files
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files` - Get user files
- `GET /api/files/:id` - Get file details
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file

### Health Check
- `GET /health` - Server health status

## 🗄️ Database Schema

### Users
- User authentication and profile information
- Role-based access control (ADMIN, USER, MODERATOR)

### Files
- File metadata and storage information
- File organization and tagging
- Public/private file access

### Folders
- Hierarchical folder structure
- Folder organization and management

### Analytics
- User activity tracking
- File operation logging
- System event monitoring

### Shares
- File sharing functionality
- Expiration and access control

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### Database Management

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npm run db:studio
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **File Type Validation**: Restrict uploadable file types
- **File Size Limits**: Configurable file size restrictions

## 📊 Monitoring & Analytics

- **Health Checks**: Database and service health monitoring
- **Activity Logging**: User actions and file operations
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Request timing and response sizes

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection string
- JWT secret key
- MinIO credentials
- Redis connection
- CORS origins

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Authentication and file management
- PostgreSQL and MinIO integration
- Redis caching and session management
