# PhysicsHub

**PhysicsHub** é uma plataforma de estudos de Física que gera **Mapas de Estudo Personalizados (MEPs)** para otimizar o aprendizado dos usuários. Inicialmente, essa plataforma atenderia a demanda de um cursinho de física. Contudo, ela foi descontinuada por falta de orçamento.

- 🧠 Inteligente e adaptativo
- 🔧 Backend em [NestJS](https://nestjs.com/)
- 🎨 Frontend em [Angular](https://angular.io/)
- 🗂️ Banco de dados [Firebase](https://firebase.google.com/)

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js (v18+)
- npm (v9+)
- Angular CLI (`npm install -g @angular/cli`)
- Firebase SDK

---

### 1. Clonando o projeto

```bash
git clone https://github.com/igorservo159/physics-plataform.git
cd physics-plataform
```

### 2. Rodando a API

```bash
cd api
npm install
npm run start:dev
```

A API estará rodando em: http://localhost:3000

### 3. Rodando o frontend

```bash
cd ../frontend
npm install
ng build     
ng serve
```

O frontend estará disponível em: http://localhost:4200

## ⚠️ Observações

### Certifique-se de que a API esteja rodando antes de iniciar o frontend.

### Verifique e atualize a URL da API nos arquivos environment.ts e environment.prod.ts do Angular, se necessário.

### Para esconder dados sensíveis (como tokens e URLs), utilize o .gitignore e arquivos .env.
