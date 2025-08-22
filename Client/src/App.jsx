import {
  useNavigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import Footer from "./Components/Footer";
import Restaurants from "./pages/Restaurants";
import DiningDetails from "./pages/DiningDetails";
import AllReviews from "./pages/AllReviews";
import MyBookings from "./pages/MyBookings";
import ResetPassword from "./Components/ResetPassword";
import RestaurantRegister from "./Components/RestaurantRegister";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Manage from "./pages/admin/Manage";
import AddDining from "./pages/admin/AddDining";
import AuthModal from "./Components/AuthModal";
import { Toaster } from "react-hot-toast";
import { useApp } from "./Context/AppContext";
import Loader from "./Components/Loader";

/**
 * Main App component that handles routing and overall layout
 * Manages authentication modal and route protection
 */
const App = () => {
  // Router and context hooks
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showRegister } = useApp();

  // Check if current path is for owners or authentication
  const isOwnerPath = location.pathname.includes("owner");
  const isAuthPath = ["/login", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );

  // Authentication modal parameters
  const shouldOpenAuthModal = searchParams.get("openAuth") === "true";
  const authView = searchParams.get("view") || "login";
  const resetSuccess = location.state?.resetSuccess;
  const resetEmail = location.state?.email;

  // ========== MAIN RENDER ========== //
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster />

      {/* Conditionally render navbar based on route */}
      {!isAuthPath && !isOwnerPath && <Navbar />}

      {/* Show restaurant registration modal if needed */}
      {showRegister && <RestaurantRegister />}

      {/* Main content area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/dinings/:_id" element={<DiningDetails />} />
          <Route path="/reviews/dinings/:id" element={<AllReviews />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/loader/:nextUrl" element={<Loader />} />

          {/* Owner/Admin Routes */}
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-dining" element={<AddDining />} />
            <Route path="manage" element={<Manage />} />
          </Route>
        </Routes>
      </main>

      {/* Conditionally render footer based on route */}
      {!isOwnerPath && !isAuthPath && <Footer />}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={shouldOpenAuthModal}
        onClose={() => navigate("/", { replace: true })}
        initialView={authView}
        resetSuccess={resetSuccess}
        resetEmail={resetEmail}
      />
    </div>
  );
};

export default App;
