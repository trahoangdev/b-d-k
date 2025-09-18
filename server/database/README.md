# 🗄️ Database Setup Guide

Hướng dẫn setup cơ sở dữ liệu PostgreSQL cho Big Data Keeper.

## 📋 Prerequisites

- PostgreSQL 14+ đã được cài đặt
- Quyền superuser (postgres) để tạo database và user
- PostgreSQL client (psql) có sẵn trong PATH

## 🚀 Quick Setup

### **Option 1: Sử dụng Script Tự Động**

#### Windows:
```bash
cd server/database
setup-windows.bat
```

#### Linux/Mac:
```bash
cd server/database
chmod +x setup-linux.sh
./setup-linux.sh
```

### **Option 2: Chạy SQL Script Thủ Công**

#### Bước 1: Kết nối PostgreSQL
```bash
psql -U postgres -h localhost
```

#### Bước 2: Chạy script setup
```sql
\i setup.sql
```

Hoặc script đơn giản:
```sql
\i quick-setup.sql
```

## 🔧 Manual Setup

### **1. Tạo Database**
```sql
CREATE DATABASE big_data_keeper;
```

### **2. Tạo User**
```sql
CREATE USER big_data_keeper_user WITH PASSWORD 'big_data_keeper_password_2024';
```

### **3. Grant Privileges**
```sql
GRANT ALL PRIVILEGES ON DATABASE big_data_keeper TO big_data_keeper_user;
```

### **4. Kết nối Database**
```sql
\c big_data_keeper;
```

### **5. Grant Schema Privileges**
```sql
GRANT ALL ON SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO big_data_keeper_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO big_data_keeper_user;
```

### **6. Enable Extensions**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 📊 Database Schema

### **Tables Created:**
- `users` - Thông tin người dùng
- `folders` - Cấu trúc thư mục
- `files` - Metadata file
- `analytics` - Theo dõi hoạt động
- `shares` - Chia sẻ file
- `system_config` - Cấu hình hệ thống

### **Enums Created:**
- `user_role` - Vai trò người dùng (ADMIN, USER, MODERATOR)
- `analytics_type` - Loại sự kiện analytics

### **Indexes Created:**
- Indexes cho performance optimization
- Full-text search indexes
- GIN indexes cho arrays và JSON

### **Views Created:**
- `user_stats` - Thống kê người dùng
- `file_stats` - Thống kê file
- `storage_usage` - Sử dụng storage

## 🔑 Default Credentials

### **Database:**
- **Database**: `big_data_keeper`
- **User**: `big_data_keeper_user`
- **Password**: `big_data_keeper_password_2024`

### **Application Users:**
- **Admin**: `admin@bigdatakeeper.com` / `admin123`
- **User**: `user@bigdatakeeper.com` / `user123`

## 🔗 Connection Strings

### **Full Connection String:**
```
postgresql://big_data_keeper_user:big_data_keeper_password_2024@localhost:5432/big_data_keeper
```

### **Environment Variable:**
```env
DATABASE_URL="postgresql://big_data_keeper_user:big_data_keeper_password_2024@localhost:5432/big_data_keeper?schema=public"
```

## 🛠️ Post-Setup Steps

### **1. Update .env File**
```env
DATABASE_URL="postgresql://big_data_keeper_user:big_data_keeper_password_2024@localhost:5432/big_data_keeper?schema=public"
```

### **2. Generate Prisma Client**
```bash
npm run db:generate
```

### **3. Run Migrations**
```bash
npm run db:migrate
```

### **4. Seed Database**
```bash
npm run db:seed
```

## 🔍 Verification

### **Check Database Connection:**
```bash
psql -h localhost -U big_data_keeper_user -d big_data_keeper
```

### **List Tables:**
```sql
\dt
```

### **Check Users:**
```sql
SELECT email, username, role FROM users;
```

### **Check System Config:**
```sql
SELECT key, value FROM system_config;
```

## 🚨 Troubleshooting

### **Error: "database does not exist"**
- Đảm bảo đã tạo database trước khi kết nối
- Kiểm tra tên database có đúng không

### **Error: "permission denied"**
- Đảm bảo user có quyền truy cập database
- Kiểm tra GRANT statements

### **Error: "extension not found"**
- Cài đặt PostgreSQL contrib packages
- Ubuntu: `sudo apt-get install postgresql-contrib`
- CentOS: `sudo yum install postgresql-contrib`

### **Error: "connection refused"**
- Kiểm tra PostgreSQL service đang chạy
- Kiểm tra firewall settings
- Kiểm tra port 5432 có mở không

## 📝 Notes

- Script `setup.sql` tạo đầy đủ schema với data mẫu
- Script `quick-setup.sql` chỉ tạo database và user cơ bản
- Sử dụng Prisma để tạo tables và migrations
- Backup database trước khi chạy script trên production

## 🔄 Reset Database

### **Drop và tạo lại:**
```sql
DROP DATABASE IF EXISTS big_data_keeper;
DROP USER IF EXISTS big_data_keeper_user;
```

Sau đó chạy lại setup script.

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra PostgreSQL logs
2. Verify connection parameters
3. Check user permissions
4. Review error messages
