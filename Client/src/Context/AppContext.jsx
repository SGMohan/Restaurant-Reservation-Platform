import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// Create App Context
const AppContext = createContext();

/**
 * Custom hook to access the App Context
 */
export const useApp = () => useContext(AppContext);

/**
 * AppProvider Component - Provides global state management for the application
 */
const AppProvider = ({ children }) => {
  // Environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const CURRENCY = import.meta.env.VITE_CURRENCY;

  // State variables
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [isLogin, setIsLogin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchRestaurants, setSearchRestaurants] = useState([]);
  const [dinings, setDinings] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  /**
   * Clears authentication data from state and localStorage
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsLogin(false);
    setIsOwner(false);
    setSearchRestaurants([]);
  }, []);

  /**
   * Fetches dining data from the backend
   */
  const fetchDinings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/dinings`);
      if (data.success) {
        setDinings(data.dinings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [BACKEND_URL]);

  /**
   * Fetches user details using the provided token
   */
  const fetchUserDetails = useCallback(
    async (currentToken) => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/auth/user/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (data?.success && data?.data) {
          setUser((prevUser) => {
            const newUser = data.data;
            return JSON.stringify(prevUser) === JSON.stringify(newUser)
              ? prevUser
              : newUser;
          });
          setSearchRestaurants((prev) => {
            const newSearches = data.data.recentSearchRestaurants || [];
            return JSON.stringify(prev) === JSON.stringify(newSearches)
              ? prev
              : newSearches;
          });
          setIsLogin(true);
          setIsOwner(data.data.role === "owner");
        } else {
          clearAuth();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuth();
        }
      } finally {
        setLoadingUser(false);
      }
    },
    [BACKEND_URL, clearAuth]
  );

  /**
   * Saves authentication data to state and localStorage
   */
  const saveAuth = useCallback(
    (userData, authToken) => {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      setUser(userData);
      setToken(authToken);
      setIsLogin(true);
      setIsOwner(userData.role === "owner");
      setLoadingUser(false);
      // Fetch user details in background without awaiting
      fetchUserDetails(authToken);
    },
    [fetchUserDetails]
  );

  /**
   * Handles user logout
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(
          `${BACKEND_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success("Logout Successful");
    } catch (error) {
      console.error("Logout error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    } finally {
      clearAuth();
    }
  }, [BACKEND_URL, token, clearAuth]);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsLogin(true);
            setIsOwner(parsedUser.role === "owner");
            setSearchRestaurants(parsedUser.recentSearchRestaurants || []);
          } catch {
            clearAuth();
          }
        }
        await fetchUserDetails(savedToken);
      } else {
        setLoadingUser(false);
      }
    };

    initializeAuth();
  }, [fetchUserDetails, clearAuth]);

  // Fetch dining data on component mount
  useEffect(() => {
    fetchDinings();
  }, [fetchDinings]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      BACKEND_URL,
      CURRENCY,
      user,
      setUser,
      isLogin,
      setIsLogin,
      isOwner,
      setIsOwner,
      token,
      setToken,
      saveAuth,
      fetchUserDetails,
      logout,
      showRegister,
      setShowRegister,
      searchRestaurants,
      setSearchRestaurants,
      loadingUser,
      setLoadingUser,
      dinings,
      setDinings,
      fetchDinings,
    }),
    [
      BACKEND_URL,
      CURRENCY,
      user,
      isLogin,
      isOwner,
      token,
      saveAuth,
      fetchUserDetails,
      logout,
      showRegister,
      searchRestaurants,
      loadingUser,
      dinings,
      fetchDinings,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// PropTypes validation
AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;