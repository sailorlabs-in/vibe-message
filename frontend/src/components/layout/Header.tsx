import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ThemeSwitcher } from "../common/ThemeSwitcher";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-4 sm:px-6 pointer-events-none">
      <header 
        className={`pointer-events-auto bg-theme-bg-secondary/90 backdrop-blur-md border border-theme-border flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl shadow-theme-border/10 overflow-hidden ${
          isMenuOpen ? "rounded-[2rem] w-full md:max-w-md max-h-[800px]" : "rounded-[2rem] w-full max-w-4xl max-h-16"
        }`}
      >
        <div className="flex justify-between items-center h-16 w-full px-6 flex-shrink-0">
          <Link to="/" className="text-xl font-bold text-theme-primary-600 dark:text-theme-primary-400 flex items-center gap-2 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="truncate tracking-tight hidden sm:block">Vibe Message</span>
            <span className="truncate tracking-tight sm:hidden">Vibe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 ml-auto">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/apps" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Apps
                </Link>
                {user.role === "SUPER_ADMIN" && (
                  <Link to="/super/users" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                    Users
                  </Link>
                )}
                <Link to="/docs" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Docs
                </Link>
                <div className="w-px h-4 bg-theme-border mx-2"></div>
                <ThemeSwitcher />
                <Link to="/profile" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Profile
                </Link>
                <button onClick={logout} className="text-sm px-4 py-2 bg-theme-bg-muted/50 hover:bg-theme-bg-muted text-theme-error/90 hover:text-theme-error rounded-full font-semibold transition-colors ml-2 border border-transparent hover:border-theme-error/20">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/docs" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Docs
                </Link>
                <div className="w-px h-4 bg-theme-border mx-2"></div>
                <ThemeSwitcher />
                <Link to="/login" className="text-sm text-theme-text-secondary hover:text-theme-primary-500 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="text-sm px-4 py-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-full font-medium transition-all shadow-lg shadow-theme-primary-500/20 hover:scale-105 ml-2">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-theme-text-primary hover:text-theme-primary-500 focus:outline-none p-2 -mr-2 transition-colors relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-theme-bg-muted"
              aria-label="Toggle Menu"
            >
              <div className="flex flex-col items-center justify-center w-5 h-5 relative">
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}></span>
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${isMenuOpen ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}></span>
                <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu Layout (Expands inside the capsule) */}
        <div 
          className={`md:hidden flex flex-col w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isMenuOpen ? "opacity-100 visible pt-2" : "opacity-0 invisible pt-0"
          }`}
        >
          <div className="px-4 pb-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Dashboard
                </Link>
                <Link to="/apps" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Apps
                </Link>
                {user.role === "SUPER_ADMIN" && (
                  <Link to="/super/users" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                    Users
                  </Link>
                )}
                <Link to="/docs" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Docs
                </Link>
                <Link to="/profile" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Profile
                </Link>
                
                <div className="flex items-center justify-between px-4 py-3 border-t border-theme-border mt-2">
                   <div className="text-sm font-medium text-theme-text-secondary">Theme</div>
                   <ThemeSwitcher />
                </div>

                <button onClick={logout} className="w-full text-center font-bold text-white bg-theme-error/90 hover:bg-theme-error px-4 py-3 mt-2 rounded-xl transition-colors shadow-lg shadow-theme-error/20">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/docs" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Docs
                </Link>
                <Link to="/login" className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors">
                  Login
                </Link>
                
                <div className="flex items-center justify-between px-4 py-3 border-t border-theme-border mt-2">
                   <div className="text-sm font-medium text-theme-text-secondary">Theme</div>
                   <ThemeSwitcher />
                </div>

                <Link to="/signup" className="block w-full text-center px-4 py-3 mt-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white font-bold rounded-xl shadow-lg shadow-theme-primary-500/20 transition-all">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
