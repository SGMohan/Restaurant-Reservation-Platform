import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import AuthModal from "./AuthModal";
import { useApp } from "../Context/AppContext";

/**
 * Navigation bar component with responsive design
 */
const Navbar = () => {
  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Restaurants", path: "/restaurants" },
    { name: "Contact", path: "/" },
    { name: "About", path: "/" },
  ];

  // Context and state management
  const { user, isLogin, logout, isOwner, setShowRegister, loadingUser } =
    useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs for click outside detection
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileProfileButtonRef = useRef(null);

  /**
   * Handles scroll effect for navbar
   */
  useEffect(() => {
    const isHomePage = location.pathname === "/";
    setIsScrolled(!isHomePage);

    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  /**
   * Handles click outside dropdown to close it
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      // Check desktop dropdown
      const isOutsideDesktop =
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target);

      // Check mobile dropdown
      const isOutsideMobile =
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target) &&
        mobileProfileButtonRef.current &&
        !mobileProfileButtonRef.current.contains(target);

      if (showDropdown && isOutsideDesktop && isOutsideMobile) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Close menu and dropdown when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  // Dynamic navbar classes based on scroll state
  const navbarClasses = `fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
    isScrolled
      ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
      : "bg-transparent text-white py-4 md:py-6"
  }`;

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  /**
   * Opens authentication modal
   */
  const handleLoginClick = () => {
    setShowAuthModal(true);
    setIsMenuOpen(false);
  };

  /**
   * Toggles dropdown menu
   * @param {Event} e - Click event
   */
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  /**
   * Handles navigation and closes menus
   * @param {string} path - Route path
   */
  const handleNavigation = (path) => {
    navigate(path);
    setShowDropdown(false);
    setIsMenuOpen(false);
  };

  /**
   * Handles dropdown navigation
   * @param {string} path - Route path
   */
  const handleDropdownNavigation = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  return (
    <>
      <nav className={navbarClasses}>
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className={`h-9 ${isScrolled ? "invert opacity-80" : ""}`}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </Link>
          ))}
          {!loadingUser && isLogin && (
            <div className="group flex flex-col gap-0.5">
              <button
                onClick={() =>
                  isOwner ? navigate("/owner") : setShowRegister(true)
                }
                className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all ${
                  isScrolled ? "text-gray-700" : "text-white"
                } text-base font-normal`}
              >
                {isOwner ? "Dashboard" : "List Your Restaurant"}
              </button>
            </div>
          )}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-5">
          <img
            src={assets.searchIcon}
            alt="searchIcon"
            className={`h-7 ${
              isScrolled ? "invert opacity-80" : ""
            } transition-all duration-300 hover:cursor-pointer`}
          />
          {isLogin ? (
            <div className="relative">
              <button
                ref={profileButtonRef}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity hover:cursor-pointer"
                onClick={toggleDropdown}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-14 right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-[60] border border-gray-200"
                >
                  <div className="py-1">
                    {!isOwner && (
                      <button
                        onClick={() => handleDropdownNavigation("/my-bookings")}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b-2 border-gray-50 hover:cursor-pointer"
                      >
                        <img src={assets.bookIcon} className="h-4 w-4 mr-3" />
                        My Bookings
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors hover:cursor-pointer"
                    >
                      <img src={assets.logoutIcon} className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 hover:cursor-pointer ${
                isScrolled ? "bg-black text-white" : "text-black bg-white"
              }`}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button and Profile */}
        <div className="flex items-center gap-3 md:hidden">
          {isLogin && (
            <div className="relative">
              <button
                ref={mobileProfileButtonRef}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity hover:cursor-pointer"
                onClick={toggleDropdown}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>
              {showDropdown && (
                <div
                  ref={mobileDropdownRef}
                  className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-[60] border border-gray-200"
                >
                  <div className="py-1">
                    {!isOwner && (
                      <button
                        onClick={() => handleDropdownNavigation("/my-bookings")}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b-2 border-gray-50"
                      >
                        <img src={assets.bookIcon} className="h-4 w-4 mr-3" />
                        My Bookings
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <img src={assets.logoutIcon} className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <img
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            src={assets.menuIcon}
            alt="menuIcon"
            className={`h-4 ${
              isScrolled ? "invert opacity-80" : ""
            } transition-all duration-300 hover:cursor-pointer`}
          />
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 z-40 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={assets.closeIcon}
              alt="close-menu"
              className="h-3.5 transition-all duration-300 hover:cursor-pointer"
            />
          </button>

          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              onClick={() => handleNavigation(link.path)}
              className="hover:text-indigo-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {isLogin && (
            <button
              onClick={() =>
                isOwner ? navigate("/owner") : setShowRegister(true)
              }
              className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all text-gray-900`}
            >
              {isOwner ? "Dashboard" : "List Your Restaurant"}
            </button>
          )}

          {!isLogin && (
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          )}
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </nav>
    </>
  );
};

export default Navbar;
