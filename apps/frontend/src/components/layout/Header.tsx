import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import {
  RiLogoutBoxLine,
  RiArrowDownSLine,
  RiUser3Line,
  RiBookOpenLine,
  RiShieldUserLine,
  RiTimeLine,
  RiApps2Line,
  RiDashboardLine,
} from '@remixicon/react';
import { ConfirmModal } from '../common/ConfirmModal';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 sm:pt-4 px-4 sm:px-6 pointer-events-none">
        <header
          className={`pointer-events-auto bg-theme-bg-secondary/85 backdrop-blur-xl border border-theme-border/80 flex flex-col transition-all duration-300 shadow-xl shadow-black/5 ${
            isMenuOpen
              ? 'rounded-3xl w-full max-w-xl max-h-[850px]'
              : 'rounded-2xl sm:rounded-full w-full max-w-6xl max-h-16'
          }`}
        >
          <div className="flex justify-between items-center h-14 sm:h-16 w-full px-4 sm:px-6 flex-shrink-0">
            {/* Brand / Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-xl bg-theme-primary-500/10 text-theme-primary-500 flex items-center justify-center border border-theme-primary-500/20 group-hover:border-theme-primary-500/40 transition-colors">
                <img src="/favicon.png" alt="Vibe Message Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-base font-bold text-theme-text-primary tracking-tight group-hover:text-theme-primary-500 transition-colors flex items-center gap-1.5">
                <span>Vibe</span>
                <span className="text-theme-primary-500">Message</span>
              </span>
            </Link>

            {/* Desktop Center Navigation Pills */}
            {user && (
              <nav className="hidden md:flex items-center gap-1 bg-theme-bg-primary/60 px-2 py-1 rounded-full border border-theme-border/60 mx-4">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-theme-bg-secondary text-theme-primary-500 shadow-sm border border-theme-border font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50'
                  }`}
                >
                  <RiDashboardLine size={14} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/apps"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive('/apps')
                      ? 'bg-theme-bg-secondary text-theme-primary-500 shadow-sm border border-theme-border font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50'
                  }`}
                >
                  <RiApps2Line size={14} />
                  <span>Apps</span>
                </Link>

                <Link
                  to="/cron-jobs"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive('/cron-jobs')
                      ? 'bg-theme-bg-secondary text-theme-primary-500 shadow-sm border border-theme-border font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50'
                  }`}
                >
                  <RiTimeLine size={14} />
                  <span>Cron Jobs</span>
                </Link>

                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/super/users"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive('/super/users')
                        ? 'bg-theme-bg-secondary text-theme-primary-500 shadow-sm border border-theme-border font-bold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50'
                    }`}
                  >
                    <RiShieldUserLine size={14} />
                    <span>Users</span>
                  </Link>
                )}

                <Link
                  to="/docs"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive('/docs')
                      ? 'bg-theme-bg-secondary text-theme-primary-500 shadow-sm border border-theme-border font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted/50'
                  }`}
                >
                  <RiBookOpenLine size={14} />
                  <span>Docs</span>
                </Link>
              </nav>
            )}

            {/* Desktop Right Actions (Theme & Account) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <ThemeSwitcher />

              {user ? (
                <>
                  <div className="w-px h-5 bg-theme-border/80 mx-0.5"></div>

                  {/* User Account Popover */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all focus:outline-none ${
                        isUserMenuOpen
                          ? 'bg-theme-bg-muted border-theme-primary-500/50 shadow-sm'
                          : 'bg-theme-bg-primary/80 hover:bg-theme-bg-muted border-theme-border'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-theme-primary-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-semibold text-theme-text-primary max-w-[110px] truncate">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      <RiArrowDownSLine
                        size={14}
                        className={`text-theme-text-secondary transition-transform duration-200 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-theme-bg-secondary border border-theme-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2.5 border-b border-theme-border/60 mb-1">
                          <p className="text-xs font-bold text-theme-text-primary truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-theme-text-muted truncate mt-0.5">
                            {user.email}
                          </p>
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-theme-primary-500/15 text-theme-primary-500 border border-theme-primary-500/25">
                            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                          >
                            <RiUser3Line size={15} />
                            <span>Profile & Settings</span>
                          </Link>
                          <Link
                            to="/docs"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                          >
                            <RiBookOpenLine size={15} />
                            <span>Documentation</span>
                          </Link>
                        </div>

                        <div className="border-t border-theme-border/60 pt-1 mt-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-theme-error hover:bg-theme-error/10 transition-colors text-left"
                          >
                            <RiLogoutBoxLine size={15} />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/docs"
                    className="text-xs text-theme-text-secondary hover:text-theme-primary-500 font-medium px-3 py-2 transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    to="/login"
                    className="text-xs px-4 py-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white rounded-full font-semibold transition-all shadow-md shadow-theme-primary-500/20 hover:scale-105"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="text-theme-text-primary hover:text-theme-primary-500 focus:outline-none p-2 -mr-1 transition-colors relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-theme-bg-muted"
                aria-label="Toggle Menu"
              >
                <div className="flex flex-col items-center justify-center w-5 h-5 relative">
                  <span
                    className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${
                      isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                    }`}
                  ></span>
                  <span
                    className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${
                      isMenuOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                    }`}
                  ></span>
                  <span
                    className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 origin-center ${
                      isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <div
            className={`md:hidden flex flex-col w-full transition-all duration-300 ease-out overflow-hidden ${
              isMenuOpen ? 'opacity-100 visible pt-2 pb-4' : 'opacity-0 invisible max-h-0'
            }`}
          >
            <div className="px-4 space-y-1 overflow-y-auto custom-scrollbar max-h-[75vh]">
              {user ? (
                <>
                  {/* Mobile User Header */}
                  <div className="p-3 bg-theme-bg-primary rounded-2xl border border-theme-border mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-theme-primary-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-theme-text-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-theme-text-muted truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-theme-primary-500/10 text-theme-primary-500">
                      {user.role === 'SUPER_ADMIN' ? 'Super' : 'Admin'}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-theme-primary-500/10 text-theme-primary-500'
                        : 'text-theme-text-primary hover:bg-theme-bg-muted'
                    }`}
                  >
                    <RiDashboardLine size={18} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/apps"
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive('/apps')
                        ? 'bg-theme-primary-500/10 text-theme-primary-500'
                        : 'text-theme-text-primary hover:bg-theme-bg-muted'
                    }`}
                  >
                    <RiApps2Line size={18} />
                    <span>Apps</span>
                  </Link>

                  <Link
                    to="/cron-jobs"
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive('/cron-jobs')
                        ? 'bg-theme-primary-500/10 text-theme-primary-500'
                        : 'text-theme-text-primary hover:bg-theme-bg-muted'
                    }`}
                  >
                    <RiTimeLine size={18} />
                    <span>Cron Jobs</span>
                  </Link>

                  {user.role === 'SUPER_ADMIN' && (
                    <Link
                      to="/super/users"
                      className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                        isActive('/super/users')
                          ? 'bg-theme-primary-500/10 text-theme-primary-500'
                          : 'text-theme-text-primary hover:bg-theme-bg-muted'
                      }`}
                    >
                      <RiShieldUserLine size={18} />
                      <span>Users</span>
                    </Link>
                  )}

                  <Link
                    to="/docs"
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive('/docs')
                        ? 'bg-theme-primary-500/10 text-theme-primary-500'
                        : 'text-theme-text-primary hover:bg-theme-bg-muted'
                    }`}
                  >
                    <RiBookOpenLine size={18} />
                    <span>Docs</span>
                  </Link>

                  <Link
                    to="/profile"
                    className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive('/profile')
                        ? 'bg-theme-primary-500/10 text-theme-primary-500'
                        : 'text-theme-text-primary hover:bg-theme-bg-muted'
                    }`}
                  >
                    <RiUser3Line size={18} />
                    <span>Profile & Settings</span>
                  </Link>

                  <div className="flex items-center justify-between px-4 py-3 border-t border-theme-border mt-3">
                    <div className="text-xs font-semibold text-theme-text-secondary">Theme</div>
                    <ThemeSwitcher />
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 font-bold text-white bg-theme-error/90 hover:bg-theme-error px-4 py-3 mt-3 rounded-xl transition-colors shadow-md shadow-theme-error/20 text-xs"
                  >
                    <RiLogoutBoxLine size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/docs"
                    className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors"
                  >
                    Login
                  </Link>

                  <div className="flex items-center justify-between px-4 py-3 border-t border-theme-border mt-2">
                    <div className="text-sm font-medium text-theme-text-secondary">Theme</div>
                    <ThemeSwitcher />
                  </div>

                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-3 mt-2 bg-theme-primary-600 hover:bg-theme-primary-700 text-white font-bold rounded-xl shadow-lg shadow-theme-primary-500/20 transition-all"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title="Sign out?"
        description="Are you sure you want to log out of your session? You will need to sign back in to access your apps and dashboard."
        confirmLabel="Yes, Sign Out"
        confirmingLabel="Signing out..."
        icon={<RiLogoutBoxLine size={28} />}
        variant="warning"
      />
    </>
  );
};
