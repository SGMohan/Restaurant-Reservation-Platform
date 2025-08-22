# 🍽️ Restaurant Reservation Platform

![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payment-008CDD?logo=stripe&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-4285F4?logo=cloudinary&logoColor=white)

A complete restaurant reservation solution with real-time booking, payment processing, and role-based dashboards built with MERN stack.

## 🌐 Live Demos
- **Frontend**: [restaurant-platform.netlify.app](https://dinearea.netlify.app)
- **Backend API**: [restaurant-api.onrender.com]([https://restaurant-api.onrender.com](https://restaurant-reservation-platform.onrender.com))

## 📌 Table of Contents
- [Features](#✨-features)
- [Technologies](#🛠️-technologies)
- [Getting Started](#🚀-getting-started)
- [API Documentation](#📚-api-documentation)
- [Environment Variables](#⚙️-environment-variables)
- [Deployment](#🌐-deployment)
- [Troubleshooting](#🐛-troubleshooting)
- [Contributing](#🤝-contributing)
- [License](#📜-license)

## ✨ Features

### 🍴 Core Restaurant Features
- 📋 Complete restaurant CRUD operations
- 🖼️ Image uploads via Cloudinary integration
- 🏢 Multi-dining area management with capacity control
- 🔍 Advanced search & filtering system
- ⭐ Customer reviews and ratings system
- 🤖 Smart recommendations based on user preferences

### 📅 Reservation Management
- ⚡ Real-time booking system
- 📊 Complete reservation lifecycle tracking
- 💳 Secure payment processing with Stripe
- 🔄 Auto-completion of past reservations
- 📱 Mobile-friendly booking flow

### 👥 User Management
- 🔐 JWT authentication with persistent sessions
- 👤 Role-based access control (Customer, Owner, Admin)
- 🎯 Personalized user dashboards
- 🔒 Secure user registration and login

## 🛠️ Technologies

**Frontend**:
- React 18 with Vite - Modern UI framework
- React Router - Client-side routing
- Context API - State management
- TailwindCSS - Utility-first styling
- Axios - HTTP client

**Backend**:
- Node.js - Runtime environment
- Express.js - Web framework
- MongoDB - NoSQL database
- Mongoose - ODM for MongoDB
- JWT - Authentication tokens
- Stripe - Payment processing
- Cloudinary - Image storage and optimization

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ v16
- MongoDB (Local or Atlas)
- Stripe Account (Test Mode)
- Cloudinary Account
- Git

### 📦 Installation
```bash
# Clone repository
git clone https://github.com/SGMohan/Restaurant-Reservation-Platform.git
cd Restaurant-Reservation-Platform

# Install backend dependencies
cd Server
npm install

# Install frontend dependencies
cd ../Client
npm install
```

### ⚙️ Environment Configuration

#### Backend (.env in Server directory)
```env
# Database Configuration
MONGO_URI=localhost:27017

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_stripe_cli

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env in Client directory)
```env
VITE_API_URL=http://localhost:5000/api
```

### 🚀 Start Development Servers
```bash
# Start backend server
cd Server
npm run dev

# Start frontend (in new terminal)
cd Client
npm run dev
```

### 💳 Stripe Setup for Testing

1. **Install Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows/Linux - download from https://stripe.com/docs/stripe-cli
```

2. **Forward webhooks to local server:**
```bash
stripe login
stripe listen --forward-to localhost:5000/api/reservation/stripe-webhook
```

3. **Test Payment Cards:**
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000000000003220`
- Use any future date for expiry, any 3-digit CVC

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/auth/register` | Register new user |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/auth/login` | User login |
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/auth/me` | Get current user profile |

### 🏪 Restaurant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/restaurants` | Get all restaurants (with filters) |
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/restaurants/:id` | Get restaurant by ID |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/restaurants` | Create restaurant (owner only) |
| ![PUT](https://img.shields.io/badge/METHOD-PUT-blue) | `/api/restaurants/:id` | Update restaurant (owner only) |
| ![DELETE](https://img.shields.io/badge/METHOD-DELETE-red) | `/api/restaurants/:id` | Delete restaurant (owner only) |


### 🏪 Dining Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/dinings` | Get all dinings (with filters) |
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/dinings/:id` | Get dinings by ID |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/dinings` | Create dinings (owner only) |
| ![PUT](https://img.shields.io/badge/METHOD-PUT-blue) | `/api/dinings/:id` | Update dinings (owner only) |
| ![DELETE](https://img.shields.io/badge/METHOD-DELETE-red) | `/api/dinings/:id` | Delete dinings (owner only) |

### 📅 Reservation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/reservation` | Get user reservations |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/reservation` | Create new reservation |
| ![PUT](https://img.shields.io/badge/METHOD-PUT-blue) | `/api/reservation/:id/status` | Update reservation status |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/reservation/stripe-webhook` | Stripe webhook handler |

### ⭐ Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/METHOD-GET-brightgreen) | `/api/reviews/dinings/:id` | Get restaurant reviews |
| ![POST](https://img.shields.io/badge/METHOD-POST-yellow) | `/api/reviews` | Create new review |

## 📂 Project Structure

```
Restaurant-Reservation-Platform/
├── Server/                    # Node.js backend
│   ├── controllers/          # Route controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Auth & validation middleware
│   ├── .env                 # Environment variables
│   └── index.js             # Main server file
│
├── Client/                   # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context providers
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── .env                 # Frontend environment variables
│
└── README.md
```

## 📊 Reservation Status Flow

### Status Lifecycle
1. **Pending** → Initial reservation created
2. **Paid** → Payment confirmed via Stripe webhook
3. **Upcoming** → Confirmed reservation (manual/auto transition)
4. **Completed** → Past reservation (auto-completed after reservation time)
5. **Cancelled** → User or restaurant cancellation

## 🌐 Deployment

### 🖥️ Backend Deployment on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

#### ⚙️ Render Configuration
1. **Service Type**: Web Service
2. **Runtime**: Node.js 16+
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Auto-Deploy**: Enabled on Git push to `main` branch

#### 📦 Environment Variables (Render Dashboard)
```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/restaurant-reservation?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS Configuration
CLIENT_URL=https://restaurant-platform.netlify.app
```

### 🎨 Frontend Deployment on Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

#### ⚙️ Netlify Configuration
1. **Site Type**: Static Site
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist/`
4. **Auto-Deploy**: Enabled on Git push to `main` branch

#### 📦 Environment Variables (Netlify Dashboard)
```env
VITE_API_URL=https://restaurant-api.onrender.com/api
```

#### 🔄 SPA Routing Setup
Create `Client/public/_redirects`:
```
/*    /index.html   200
```

## 🐛 Troubleshooting

### Stripe Webhook Issues
- ✅ Verify webhook endpoint: `/api/reservation/stripe-webhook`
- ✅ Check `STRIPE_WEBHOOK_SECRET` in environment variables
- ✅ Ensure webhook handler uses `express.raw()` middleware
- ✅ Confirm Stripe CLI is forwarding to correct port

### CORS Configuration
- ✅ Add frontend domain to backend CORS origins
- ✅ Include `credentials: true` in CORS config
- ✅ Verify `CLIENT_URL` environment variable
- ✅ Check API requests are going to correct backend URL

### Authentication Issues
- ✅ Verify JWT secret consistency across environments
- ✅ Check token storage in localStorage
- ✅ Confirm JWT expiry settings
- ✅ Review browser network tab for auth headers

### Netlify Build Problems
- ✅ Ensure folder name is "Client"
- ✅ Verify build command: `npm run build`
- ✅ Check all environment variables are set
- ✅ Add `_redirects` file for SPA routing

## 🗺️ Roadmap

- 📧 Email notifications for booking confirmations
- 📱 SMS reminders via Twilio integration
- 📊 Advanced analytics dashboard
- 🌍 Multi-language support
- 📱 Mobile app development
- 🍽️ Table management system
- 🎁 Loyalty program integration
- 🔗 Social media login (Google/Facebook)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ using the MERN stack**
