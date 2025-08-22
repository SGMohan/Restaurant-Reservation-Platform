import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useApp } from "../Context/AppContext";
import { toast } from "react-hot-toast";
import axios from "axios";

/**
 * Component for resetting user password with a token from email
 */
const ResetPasswordPage = () => {
  // Get backend URL from app context
  const { BACKEND_URL } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State variables
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Get token and email from URL parameters
  const resetToken = searchParams.get("token");
  const resetEmailFromUrl = searchParams.get("email");

  // Validate token on component mount
  useEffect(() => {
    if (!resetToken || !resetEmailFromUrl) {
      navigate("/");
      return;
    }
    validateResetToken();
  }, [resetToken, resetEmailFromUrl]);

  // Redirect to login after successful password reset
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/?openAuth=true&view=login", {
          state: {
            resetSuccess: true,
            email: decodeURIComponent(resetEmailFromUrl),
          },
        });
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate, resetEmailFromUrl]);

  /**
   * Validates the reset token from the URL
   */
  const validateResetToken = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/auth/validate-resetToken/${resetToken}`,
        {
          params: {
            email: decodeURIComponent(resetEmailFromUrl),
          },
        }
      );

      if (res.data.valid) {
        setIsValidToken(true);
        setEmail(decodeURIComponent(resetEmailFromUrl));
      } else {
        setIsValidToken(false);
        toast.error(res.data.message || "Invalid or expired reset link");
      }
    } catch (err) {
      setIsValidToken(false);
      console.error("Validation error:", err);

      if (err.response) {
        if (err.response.status === 404) {
          toast.error("Validation endpoint not found - contact support");
        } else {
          toast.error(err.response.data?.message || "Error validating token");
        }
      } else {
        toast.error("Network error - please check your connection");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission for password reset
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/auth/reset-password`, {
        resetToken,
        email: decodeURIComponent(resetEmailFromUrl),
        newPassword: password,
      });

      if (res.data.success) {
        setIsSuccess(true);
        toast.success(res.data.message || "Password reset successful", {
          autoClose: 5000,
        });
      } else {
        setError(res.data.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Password reset failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/src/assets/heroImage.jpg')] bg-no-repeat bg-cover bg-center"></div>

        {/* Backdrop Blur Overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md"></div>

        {/* Logo */}
        <div className="relative z-10 top-0 left-5 p-8">
          <img
            src={assets.logo}
            alt="Restaurant Logo"
            className="h-9 absolute"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm mx-4 text-black">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
            <p className="text-gray-600 text-sm text-center">
              Validating reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/src/assets/heroImage.jpg')] bg-no-repeat bg-cover bg-center"></div>

        {/* Backdrop Blur Overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md"></div>

        {/* Logo */}
        <div className="z-10 absolute top-0 left-5 p-8">
          <img src={assets.logo} alt="Restaurant Logo" className="h-9" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm mx-4 text-black text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Invalid Reset Link
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              This password reset link has expired or is invalid.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-br from-slate-500 to-slate-900 text-white py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity hover:cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/src/assets/heroImage.jpg')] bg-no-repeat bg-cover bg-center"></div>

      {/* Backdrop Blur Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md"></div>

      {/* Logo */}
      <div className="z-10 absolute top-0 left-5 p-8">
        <img src={assets.logo} alt="Restaurant Logo" className="h-9" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm mx-4 text-black">
          <h2 className="text-xl font-semibold text-black text-center mb-2">
            {isSuccess ? "Password Reset Successful" : "Reset Your Password"}
          </h2>

          <p className="text-gray-500 text-center mb-2 text-sm">
            For: <span className="font-medium">{email}</span>
          </p>

          {!isSuccess ? (
            <>
              <p className="text-gray-600 text-center mb-6 text-xs">
                Enter your new password
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Password Input */}
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
                    placeholder="New Password"
                    required
                    disabled={isLoading || isSuccess}
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="flex items-center gap-3 w-full rounded-full px-5 py-2.5 mb-6 text-black border-2 border-gray-400 focus-within:border-indigo-500 transition-colors">
                  <img
                    src={assets.lockIcon}
                    alt="Lock Icon"
                    className="invert opacity-100"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="outline-none text-gray-600 flex-1 min-w-0"
                    placeholder="Confirm Password"
                    required
                    disabled={isLoading || isSuccess}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full bg-gradient-to-br from-slate-500 to-slate-900 text-white py-2.5 rounded-full font-medium hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200 text-center">
              Your password has been successfully updated. Redirecting to login
              in 5 seconds...
            </div>
          )}

          {/* Login link */}
          <p className="text-center mt-4 text-gray-800 text-xs">
            Remember your password?{" "}
            <button
              onClick={() =>
                navigate("/?openAuth=true&view=login", {
                  state: {
                    resetSuccess: true,
                    email: decodeURIComponent(resetEmailFromUrl),
                  },
                })
              }
              className="text-indigo-700 cursor-pointer underline hover:text-indigo-800"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
