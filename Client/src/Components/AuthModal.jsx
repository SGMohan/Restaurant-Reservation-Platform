import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useApp } from "../Context/AppContext";
import { toast } from "react-hot-toast";
import axios from "axios";

/**
 * Authentication Modal Component
 * Handles login, signup, and password reset functionality
 */
const AuthModal = ({
  isOpen,
  onClose,
  initialView = "login",
  resetSuccess = false,
  resetEmail = "",
}) => {
  // Context and navigation hooks
  const { BACKEND_URL, saveAuth } = useApp();
  const navigate = useNavigate();

  // State management
  const [view, setView] = useState(initialView);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(resetEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmailInput, setResetEmailInput] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial state based on props
  useEffect(() => {
    if (resetSuccess && resetEmail) {
      setEmail(resetEmail);
    }
  }, [resetSuccess, resetEmail]);

  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (view === "signup") {
        // Handle user registration
        const res = await axios.post(`${BACKEND_URL}/auth/register`, {
          name,
          email,
          password,
        });

        if (res.data.success) {
          // After successful registration, automatically log them in
          const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
            email,
            password,
          });

          if (loginRes.data.success) {
            toast.success(loginRes.data.message);
            saveAuth(loginRes.data.data, loginRes.data.token);
            onClose();
            navigate("/");
          }
        } else {
          setError(res.data.message || "Signup failed");
        }
      } else if (view === "login") {
        // Handle user login
        const res = await axios.post(`${BACKEND_URL}/auth/login`, {
          email,
          password,
        });
        if (res.data.success) {
          toast.success("Login successful");
          saveAuth(res.data.data, res.data.token);
          onClose();
          navigate("/");
        } else {
          setError(res.data.message || "Login failed");
        }
      } else if (view === "forgot") {
        // Handle password reset request - FIXED: Don't treat 400 as error
        const res = await axios.post(`${BACKEND_URL}/auth/forgot-password`, {
          email: resetEmailInput,
        });

        // Always show success message for security (even if email doesn't exist)
        setView("check-email");
        setError(null);
      }
    } catch (error) {
      console.error("Authentication error:", error);

      if (view === "forgot") {
        // For forgot password, always show success message for security
        setView("check-email");
        setError(null);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.";
        setError(errorMessage);

        if (!error.response?.data?.message) {
          toast.error(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setPassword("");
      setConfirmPassword("");
      setResetEmailInput("");
      setError(null);
      setSuccess(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /**
   * Renders header based on current view
   */
  const renderHeader = () => {
    switch (view) {
      case "signup":
        return {
          title: "Create your account",
          subtitle: "Welcome! Please fill in the details to get started",
        };
      case "forgot":
        return {
          title: "Forgot your password?",
          subtitle:
            "Enter your email address and we'll send you a link to reset your password",
        };
      case "check-email":
        return {
          title: "Check Your Email",
          subtitle: "",
        };
      default: // login
        return {
          title: "Sign in to DineArea",
          subtitle: "Welcome back! Please sign in to continue",
        };
    }
  };

  /**
   * Renders form based on current view
   */
  const renderForm = () => {
    switch (view) {
      case "signup":
        return (
          <>
            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.personIcon}
                alt="Person Icon"
                className="invert opacity-100"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Full Name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.mailIcon}
                alt="Mail Icon"
                className="invert opacity-100"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Email Address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.lockIcon}
                alt="Lock Icon"
                className="invert opacity-100"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-slate-500 to-slate-900 text-white py-2.5 rounded-full font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </>
        );

      case "forgot":
        return (
          <>
            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.mailIcon}
                alt="Mail Icon"
                className="invert opacity-100"
              />
              <input
                type="email"
                value={resetEmailInput}
                onChange={(e) => setResetEmailInput(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Email Address"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-slate-500 to-slate-900 text-white py-2.5 rounded-full font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        );

      case "check-email":
        return (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center h-16 w-16 bg-gray-900 rounded-full">
                <img
                  src={assets.mailIcon}
                  alt="Mail Icon"
                  className="w-8 h-8 opacity-70"
                />
              </div>
            </div>

            <p className="text-gray-600 mb-4 text-sm">
              We've sent a password reset link to{" "}
              <span className="text-gray-800 font-medium">
                {resetEmailInput}
              </span>
            </p>

            <p className="text-gray-500 text-xs mb-6">
              The link will expire in 15 minutes. If you don't see the email,
              check your spam folder.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setView("forgot");
                  setResetEmailInput("");
                }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:cursor-pointer hover:underline transition-colors"
              >
                Resend Email
              </button>

              <button
                onClick={() => setView("login")}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium hover:cursor-pointer hover:underline transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      default: // login
        return (
          <>
            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.mailIcon}
                alt="Mail Icon"
                className="invert opacity-100"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Email Address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-4 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
              <img
                src={assets.lockIcon}
                alt="Lock Icon"
                className="invert opacity-100"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="outline-none text-gray-600 flex-1 min-w-0"
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </div>

            <p
              onClick={() => setView("forgot")}
              className="text-indigo-700 mb-4 cursor-pointer text-xs hover:underline"
            >
              Forgot Password?
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-slate-500 to-slate-900 text-white py-2.5 rounded-full font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </>
        );
    }
  };

  /**
   * Renders footer based on current view
   */
  const renderFooter = () => {
    switch (view) {
      case "signup":
        return (
          <p className="text-center mt-4 text-gray-800 text-xs">
            Already have an account?{" "}
            <span
              onClick={() => setView("login")}
              className="text-indigo-700 cursor-pointer underline hover:text-indigo-800"
            >
              Login
            </span>
          </p>
        );
      case "forgot":
        return (
          <p className="text-center mt-4 text-gray-800 text-xs">
            Remember your password?{" "}
            <span
              onClick={() => setView("login")}
              className="text-indigo-700 cursor-pointer underline hover:text-indigo-800"
            >
              Sign In
            </span>
          </p>
        );
      case "check-email":
        return null; // Footer is handled within the form for this view
      default: // login
        return (
          <p className="text-center mt-4 text-gray-800 text-xs">
            Don't have an account?{" "}
            <span
              onClick={() => setView("signup")}
              className="text-indigo-700 cursor-pointer underline hover:text-indigo-800"
            >
              Sign Up
            </span>
          </p>
        );
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 overflow-hidden"></div>
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        ></div>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="relative bg-white shadow-lg rounded-lg p-8 w-full max-w-sm mx-auto text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:cursor-pointer hover:text-gray-600 transition-colors"
            >
              <img
                src={assets.closeIcon}
                alt="closeIcon"
                className="w-2.5 h-2.5"
              />
            </button>

            <h2 className="text-xl font-semibold text-black text-center mb-2">
              {renderHeader().title}
            </h2>
            {renderHeader().subtitle && (
              <p className="text-gray-500 text-center mb-8 text-xs">
                {renderHeader().subtitle}
              </p>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded border border-green-200">
                {success}
              </div>
            )}

            {view === "check-email" ? (
              renderForm()
            ) : (
              <form onSubmit={onSubmitHandler}>{renderForm()}</form>
            )}

            {renderFooter()}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AuthModal;
