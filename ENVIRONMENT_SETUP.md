# Environment Setup Guide

## 🔧 การตั้งค่า Environment Variables

### 1. สร้างไฟล์ .env

```bash
# คัดลอกไฟล์ template
cp env.example .env

# แก้ไขไฟล์ .env
nano .env
# หรือ
code .env
```

### 2. ตั้งค่าพื้นฐานที่จำเป็น

#### **สำหรับ Development:**
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-dev-secret-key-at-least-32-characters
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=rmu_parttime_dev
FRONTEND_URL=http://localhost:3001
DEBUG=true
```

#### **สำหรับ Production:**
```env
NODE_ENV=production
PORT=80
JWT_SECRET=your-super-secure-production-secret-key-min-32-chars
DATABASE_URL=postgresql://user:password@host:5432/dbname
FRONTEND_URL=https://yourdomain.com
DB_SSL=true
```

### 3. ตรวจสอบการตั้งค่า

เมื่อเริ่มเซิร์ฟเวอร์ ระบบจะแสดงสถานะของ environment variables:

```bash
bun run dev
```

ผลลัพธ์:
```
🔧 Environment Configuration Status:
=====================================
✅ All required environment variables are set

📝 Current configuration:
   NODE_ENV: development
   PORT: 3000
   DB_HOST: localhost
   DB_NAME: rmu_parttime_dev
   FRONTEND_URL: http://localhost:3001
=====================================
```

## 📋 Environment Variables อธิบาย

### 🏃‍♂️ **จำเป็น (Required)**

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | สภาพแวดล้อมการรัน | `development`, `production` |
| `PORT` | พอร์ตเซิร์ฟเวอร์ | `3000` |
| `JWT_SECRET` | Secret key สำหรับ JWT | อย่างน้อย 32 ตัวอักษร |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `rmu_parttime` |

### 🔒 **Security & Auth**

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | JWT token อายุ | `24h` |
| `MIN_PASSWORD_LENGTH` | รหัสผ่านขั้นต่ำ | `6` |
| `MAX_LOGIN_ATTEMPTS` | จำนวนล็อกอินผิดสูงสุด | `5` |
| `RATE_LIMIT_MAX_REQUESTS` | Request limit ต่อ window | `100` |

### 🌐 **Network & CORS**

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend URL สำหรับ CORS | `http://localhost:3001` |
| `HOST` | Server binding host | `localhost` |

### 📧 **Email (Optional)**

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |
| `FROM_EMAIL` | ส่งจากอีเมล | `noreply@rmu.ac.th` |

### 📁 **File Upload (Optional)**

| Variable | Description | Default |
|----------|-------------|---------|
| `UPLOAD_DIR` | โฟลเดอร์อัพโหลด | `uploads` |
| `MAX_FILE_SIZE` | ขนาดไฟล์สูงสุด (bytes) | `5242880` (5MB) |
| `ALLOWED_FILE_TYPES` | ประเภทไฟล์ที่อนุญาต | `jpg,jpeg,png,pdf,doc,docx` |

### 🔧 **Development**

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | เปิด debug mode | `false` |
| `SEED_DATABASE` | เติมข้อมูลตัวอย่าง | `false` |
| `ENABLE_SWAGGER` | เปิด API documentation | `true` |

## 🚨 คำเตือนสำคัญ

### **Security Checklist:**

✅ **เปลี่ยน `JWT_SECRET`** - ห้ามใช้ค่า default  
✅ **เปลี่ยน `DB_PASSWORD`** - ใช้รหัสผ่านที่แข็งแรง  
✅ **ตั้ง `NODE_ENV=production`** - สำหรับ production  
✅ **เปิด `DB_SSL=true`** - สำหรับ production database  
✅ **ตั้ง `FRONTEND_URL`** - URL จริงของ frontend  

### **ห้ามทำ:**

❌ Commit ไฟล์ `.env` เข้า Git  
❌ Share JWT_SECRET ให้คนอื่น  
❌ ใช้ default passwords ใน production  
❌ เปิด DEBUG ใน production  

## 🛠️ การแก้ปัญหา

### ปัญหา: "Missing required environment variables"

**วิธีแก้:**
1. ตรวจสอบว่ามีไฟล์ `.env` หรือไม่
2. เปรียบเทียบกับ `env.example`
3. ตรวจสอบชื่อ variables ให้ถูกต้อง

### ปัญหา: Database connection failed

**วิธีแก้:**
1. ตรวจสอบ `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
2. ทดสอบเชื่อมต่อ database ด้วย tool อื่น
3. ตรวจสอบว่า database service ทำงานอยู่

### ปัญหา: CORS error

**วิธีแก้:**
1. ตั้ง `FRONTEND_URL` ให้ตรงกับ URL ของ frontend
2. ตรวจสอบ protocol (http/https)
3. ตรวจสอบ port number

## 🔄 Environment สำหรับ Environments ต่างๆ

### **Development (.env.development)**
```env
NODE_ENV=development
DEBUG=true
DB_NAME=rmu_parttime_dev
SEED_DATABASE=true
```

### **Testing (.env.test)**
```env
NODE_ENV=test
DB_NAME=rmu_parttime_test
JWT_SECRET=test-secret-key-32-characters-long
```

### **Production (.env.production)**
```env
NODE_ENV=production
DB_SSL=true
DEBUG=false
LOG_LEVEL=error
```

## 📝 ตัวอย่างไฟล์ .env ที่สมบูรณ์

```env
# Required
NODE_ENV=development
PORT=3000
JWT_SECRET=my-super-secret-development-key-32-chars
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=mypassword123
DB_NAME=rmu_parttime_dev

# Network
FRONTEND_URL=http://localhost:3001

# Optional - Development
DEBUG=true
SEED_DATABASE=true
ENABLE_SWAGGER=true

# Optional - Email (leave empty if not using)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@rmu.ac.th
```

หลังจากตั้งค่าเสร็จแล้ว รันคำสั่ง:

```bash
bun run dev
```

ระบบจะแสดงสถานะการตั้งค่าและเริ่มทำงาน! 🚀 