# PhysicsHub

**PhysicsHub** is a Physics study platform that generates **Personalized Study Maps (PSMs)** to optimize users' learning experiences. Initially, the platform was developed to serve the needs of a physics prep course. However, it was discontinued due to budget constraints.

- 🧠 Intelligent and adaptive  
- 🔧 Backend powered by [NestJS](https://nestjs.com/)  
- 🎨 Frontend built with [Angular](https://angular.io/)  
- 🗂️ Database managed with [Firebase](https://firebase.google.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- Angular CLI (`npm install -g @angular/cli`)
- Firebase SDK

---

### 1. Clone the repository

```bash
git clone https://github.com/igorservo159/physics-plataform.git
cd physics-plataform
```

### 2. Run the API

```bash
cd api
npm install
npm run start:dev
```
The API will be running at: http://localhost:3000

### 3. Run the frontend

```bash
cd ../frontend
npm install
ng build
ng serve
```
The frontend will be available at: http://localhost:4200

## ⚠️ Notes

### Make sure to check and update the API environment configuration.

### Make sure to check and update the Frontend environment configuration.

### To keep sensitive data (such as tokens and URLs) safe, use .env files and add them to .gitignore.
