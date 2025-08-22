import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import Sidebar from "../../Components/admin/Sidebar";
import { useApp } from "../../Context/AppContext";
import { useEffect } from "react";

/**
 * Layout Component - Wrapper for admin pages with navigation and sidebar
 */
const Layout = () => {
  const navigate = useNavigate();
  const { token } = useApp();

  // Redirect to home if no token (not authenticated)
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 pt-8 md:pt-10 md:px-8 lg:px-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
