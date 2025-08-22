# Restaurant Reservation Platform

A full-stack MERN application for restaurant reservations with real-time booking, payment processing, and role-based dashboards.

## 🚀 Features

### Core Features
- **User Management**: Registration, login, JWT authentication with persistent sessions
- **Restaurant Management**: CRUD operations with image uploads via Cloudinary
- **Dining Areas**: Multiple areas per restaurant with capacity management
- **Advanced Search & Filters**: Cuisine type, guest count, features, dietary options, ambiance, availability
- **Real-time Reservations**: Complete booking lifecycle with status tracking
- **Payment Processing**: Stripe integration with test mode support
- **Reviews System**: Customer feedback and ratings
- **Smart Recommendations**: Based on recent search preferences

### User Roles
- **Customer**: Browse, search, book, review restaurants
- **Restaurant Owner**: Manage restaurants, dining areas, view bookings
- **Admin**: System-wide management and oversight

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Context API (useApp) for state management
- Tailwind CSS / styled-components for styling

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Cloudinary for image storage
- Stripe for payment processing

**Deployment:**
- Frontend: Netlify/Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```
Restaurant-Reservation-Platform/
├── Client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── Server/                    # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── README.md
```

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Stripe account (test mode)
- Cloudinary account

### 1. Clone Repository
```bash
git clone https://github.com/SGMohan/Restaurant-Reservation-Platform.git
cd Restaurant-Reservation-Platform
```

### 2. Backend Setup
```bash
cd Server
npm install
```

Create `.env` in Server directory:
```env
# Database
MONGO_URI=mongodb://localhost:27017/restaurant-reservation
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/restaurant-reservation

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_stripe_cli

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

Start backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd Client
npm install
```

Create `.env` in Client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 4. Stripe Setup for Testing

#### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows/Linux - download from https://stripe.com/docs/stripe-cli
```

#### Forward webhooks to local server
```bash
stripe login
stripe listen --forward-to localhost:5000/api/reservation/stripe-webhook
```

Copy the webhook signing secret (starts with `whsec_`) to your Server `.env` file as `STRIPE_WEBHOOK_SECRET`.

#### Test Payment Cards
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000000000003220`
- Use any future date for expiry, any 3-digit CVC

## 🔌 API Overview

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
```

### Restaurants
```
GET    /api/restaurant              # Get all restaurants (with filters)
GET    /api/restaurant/:id          # Get restaurant by ID
POST   /api/restaurant              # Create restaurant (owner only)
PUT    /api/restaurant/:id          # Update restaurant (owner only)
DELETE /api/restaurant/:id          # Delete restaurant (owner only)
```

### Reservations
```
GET  /api/reservation              # Get user reservations
POST /api/reservation              # Create reservation
PUT  /api/reservation/:id/status   # Update reservation status
POST /api/reservation/stripe-webhook # Stripe webhook handler
```

### Reviews
```
GET  /api/review/restaurant/:id    # Get restaurant reviews
POST /api/review                   # Create review
```

## 📊 Reservation Lifecycle

### Status Flow
1. **Pending** → Initial reservation created
2. **Paid** → Payment confirmed via Stripe webhook
3. **Upcoming** → Confirmed reservation (manual/auto transition)
4. **Completed** → Past reservation (auto-completed after reservation time)
5. **Cancelled** → User or restaurant cancellation

### Auto-Completion
- Reservations automatically transition from "Upcoming" to "Completed" when the reservation date/time has passed
- Runs on server startup and during status checks

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`
6. Update `CLIENT_URL` to your frontend domain

### Frontend (Netlify)
1. Build locally: `cd Client && npm run build`
2. Deploy `dist` folder to Netlify
3. **Important**: Ensure build folder is named "Client" not "Cient"
4. Add environment variables in Netlify dashboard
5. Configure redirects for SPA:

Create `Client/public/_redirects`:
```
/*    /index.html   200
```

### CORS Configuration
Update backend CORS settings for production:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-netlify-app.netlify.app",
    "https://your-custom-domain.com"
  ],
  credentials: true
}));
```

## 🐛 Troubleshooting

### Stripe Webhook 404 Error
- [ ] Verify webhook endpoint: `/api/reservation/stripe-webhook`
- [ ] Ensure Stripe CLI is forwarding to correct port
- [ ] Check `STRIPE_WEBHOOK_SECRET` in server `.env`
- [ ] Verify webhook handler uses `express.raw()` middleware

### CORS Issues
- [ ] Add frontend domain to backend CORS origins
- [ ] Include `credentials: true` in CORS config
- [ ] Check `CLIENT_URL` environment variable
- [ ] Verify frontend is making requests to correct API URL

### Persistent Login Issues
- [ ] Check JWT secret consistency
- [ ] Verify token storage in localStorage/cookies
- [ ] Confirm JWT expiry settings
- [ ] Check browser network tab for auth headers

### Netlify Build Errors
- [ ] Verify folder name is "Client" not "Cient"
- [ ] Check build command: `npm run build`
- [ ] Ensure all environment variables are set
- [ ] Add `_redirects` file for SPA routing

### Payment Processing
- [ ] Confirm Stripe keys (public/secret) are correct
- [ ] Check webhook secret matches Stripe CLI output
- [ ] Verify test card numbers
- [ ] Ensure raw body parsing for webhook endpoint

## 🗺️ Roadmap

- [ ] Email notifications for booking confirmations
- [ ] SMS reminders via Twilio
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Table management system
- [ ] Loyalty program integration
- [ ] Social media login (Google/Facebook)

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**SGMohan**
- GitHub: [@SGMohan](https://github.com/SGMohan)
- Project Link: [Restaurant Reservation Platform](https://github.com/SGMohan/Restaurant-Reservation-Platform)

---

**Built with ❤️ using the MERN stack**
