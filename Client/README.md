# 🍴 Restaurant Reservation Platform - Frontend

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4+-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?logo=tailwindcss&logoColor=white)

Modern React frontend for restaurant reservation management with real-time booking, payment integration, and responsive design.

## 🌐 Live Demo
- **Frontend**: [restaurant-platform.netlify.app](https://dinearea.netlify.app)

## 🛠️ Technologies

- **React 18** with Vite - Modern UI framework
- **React Router** - Client-side routing
- **Context API** - State management
- **TailwindCSS** - Utility-first styling
- **Axios** - HTTP client

## ✨ Features

### 🍴 User Experience
- 🔍 Advanced search & filtering system
- 📱 Mobile-friendly responsive design
- ⚡ Real-time booking system
- 💳 Secure payment flow with Stripe
- ⭐ Customer reviews and ratings
- 🤖 Smart restaurant recommendations

### 👥 Role-Based Dashboards
- 👤 **Customer Dashboard**: Manage bookings and reviews
- 🏪 **Restaurant Owner**: Manage restaurants and reservations
- 🔧 **Admin Panel**: System-wide management

### 🎨 Modern UI Features
- 🌙 Clean, intuitive interface
- 🔄 Loading states and error handling
- 📊 Interactive booking calendar
- 🖼️ Image galleries and previews

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ v16
- Backend API running (see backend README)

### 📦 Installation
```bash
# Clone repository and navigate to client
git clone https://github.com/SGMohan/Restaurant-Reservation-Platform.git
cd Restaurant-Reservation-Platform/Client

# Install dependencies
npm install
```

### ⚙️ Environment Configuration

Create `.env` file in Client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 🚀 Start Development Server
```bash
npm run dev
```

## 📂 Project Structure

```
Client/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── context/         # Context providers
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
└── .env                # Environment variables
```

## 🎯 Key Components

### Authentication System
- Login/Register forms
- JWT token management
- Protected routes
- Role-based access control

### Restaurant Features
- Restaurant listing with filters
- Detailed restaurant view
- Image galleries
- Review system

### Booking System
- Date and time selection
- Party size management
- Payment integration
- Booking confirmation

### Dashboard Components
- User profile management
- Reservation history
- Restaurant management (owners)
- Analytics views

## 💳 Payment Integration

### Test Payment Cards
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000000000003220`
- Use any future date for expiry, any 3-digit CVC

## 🌐 Deployment on Netlify

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

## 🎨 Styling & Design

### TailwindCSS Configuration
- Custom color palette
- Responsive breakpoints
- Component utilities
- Dark mode support (if implemented)

### Design System
- Consistent spacing scale
- Typography hierarchy
- Button variants
- Form styling
- Loading animations

## 🐛 Troubleshooting

### Build Issues
- ✅ Ensure Node.js version ≥ 16
- ✅ Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- ✅ Check environment variables are set correctly
- ✅ Verify API URL is accessible

### API Connection Issues
- ✅ Confirm backend server is running
- ✅ Check CORS settings on backend
- ✅ Verify `VITE_API_URL` environment variable
- ✅ Check browser network tab for API errors

### Netlify Deployment Problems
- ✅ Verify build command: `npm run build`
- ✅ Check all environment variables are set
- ✅ Add `_redirects` file for SPA routing
- ✅ Ensure dist folder is being generated

### Authentication Issues
- ✅ Check token storage in localStorage
- ✅ Verify API requests include auth headers
- ✅ Confirm JWT token format and expiry

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Use TailwindCSS for styling
- Maintain responsive design principles
- Write meaningful commit messages
- Test on multiple screen sizes

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ using React and modern web technologies**
