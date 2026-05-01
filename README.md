# Equipment Booking & Resource Management System

A full-stack web application to manage shared resources like lab equipment, enabling users to request bookings and admins to manage approvals efficiently.

# Features
## Authentication
User signup & login
JWT-based authentication
Role-based access (student / admin)
## Resource Management
Add / update / delete resources
View available equipment
Track availability
## Booking System
Request equipment booking
Approve / reject requests
Mark resources as returned
Prevent conflicts
## Frontend
Built with React (Vite)
Responsive UI
Dashboard and navigation
## Architecture
Frontend: React (Vite)
Backend: Node.js (Microservices)
Auth Service
Resource Service
Booking Service
API Gateway
Database: MongoDB Atlas
Deployment: AWS EC2
Process Manager: PM2

# Deployment:
The application is deployed on AWS EC2 and accessible via public IP.

# Live URLs
## Frontend:
http://98.130.124.48:3000

## API Gateway:
http://98.130.124.48:4000

## Auth Service:
http://98.130.124.48:4001
# API Endpoints
## Authentication
POST /auth/signup
POST /auth/login
GET  /auth/me
## Resources
GET    /resources
POST   /resources
PUT    /resources/:id
DELETE /resources/:id
## Bookings
POST  /bookings
GET   /bookings
PATCH /bookings/:id/decision
PATCH /bookings/:id/return

# Database
MongoDB Atlas is used for data persistence.
Collections
Users
Resources
Bookings

# Installation & Setup
## 1) Clone the repo
git clone https://github.com/KollaNagaManasa/2024tm93519-Full-Stack-Application-Development-Assignment
cd 2024tm93519-Full-Stack-Application-Development-Assignment
## 2) Setup Backend (Auth Service example)
cd services/auth-service
npm install
## 3) Create .env
PORT=4001
MONGO_URI=mongodb+srv://<username>:<password>@cluster/fsad_lab_booking
JWT_SECRET=your_secret
## 4) Run Services (using PM2)
pm2 start src/index.js --name auth-service
pm2 start src/index.js --name resource-service
pm2 start src/index.js --name booking-service
pm2 start src/index.js --name api-gateway
## 5) Run Frontend
cd frontend
npm install
npm run dev

# AI Usage
AI tools such as ChatGPT and Cursor were used for:

Debugging MongoDB Atlas connection
Fixing authentication issues
Generating API structure
Troubleshooting deployment on EC2

# Demo Video
https://drive.google.com/drive/folders/1OJ8HrZTwTRwozU9chGB6d4X641Aaz-y4

# Project Highlights
Microservice-based architecture
JWT authentication
MongoDB Atlas integration
AWS EC2 deployment
Full frontend-backend integration
