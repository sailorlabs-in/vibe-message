import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
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
  RiArrowRightLine,
} from '@remixicon/react';
import { ConfirmModal } from '../common/ConfirmModal';

const ORIGINAL_DOCS_URL = 'https://vibemessage.sailorlabs.in/docs';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSelfHosted } = useSystem();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

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

  const isPublicHome = location.pathname === '/' && !user && !isSelfHosted;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3 sm:pt-4 px-4 sm:px-6 pointer-events-none">
        <motion.header
          initial={shouldReduceMotion ? { opacity: 1 } : { y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className={`pointer-events-auto bg-theme-bg-secondary/90 dark:bg-[#11131a]/90 backdrop-blur-2xl border border-theme-border flex flex-col transition-all duration-300 shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] ${
            isMenuOpen
              ? 'rounded-3xl w-full max-w-xl max-h-[850px]'
              : 'rounded-2xl sm:rounded-full w-full max-w-6xl max-h-16'
          }`}
        >
          <div className="flex justify-between items-center h-14 sm:h-16 w-full px-4 sm:px-6 flex-shrink-0">
            {/* Brand / Logo */}
            <Link
              to={isSelfHosted ? (user ? '/dashboard' : '/login') : '/'}
              className="flex items-center gap-2.5 flex-shrink-0 group transition-opacity duration-200 hover:opacity-90"
            >
              <img
                src="/favicon.png"
                alt="Vibe Message Logo"
                className={`w-5 h-5 object-contain transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                  isSelfHosted ? 'brand-logo-img' : ''
                }`}
              />
              <span className="text-sm sm:text-base font-display font-bold text-theme-text-primary tracking-tight flex items-center gap-1 whitespace-nowrap">
                <span>Vibe</span>
                <span className="text-theme-primary-500 font-extrabold">Message</span>
              </span>
            </Link>

            {/* Desktop Navigation for Logged In User */}
            {user && (
              <nav className="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-full mx-2 xl:mx-3 shrink-0 border border-theme-border">
                <Link
                  to="/dashboard"
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/dashboard')
                      ? 'text-theme-primary-600 dark:text-theme-primary-400 font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {isActive('/dashboard') && (
                    <motion.div
                      layoutId="header-active-nav"
                      className="absolute inset-0 bg-theme-bg-secondary shadow-xs rounded-full border border-theme-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <RiDashboardLine size={14} className="shrink-0 relative z-10" />
                  <span className="relative z-10">Dashboard</span>
                </Link>

                <Link
                  to="/apps"
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/apps')
                      ? 'text-theme-primary-600 dark:text-theme-primary-400 font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {isActive('/apps') && (
                    <motion.div
                      layoutId="header-active-nav"
                      className="absolute inset-0 bg-theme-bg-secondary shadow-xs rounded-full border border-theme-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <RiApps2Line size={14} className="shrink-0 relative z-10" />
                  <span className="relative z-10">Apps</span>
                </Link>

                <Link
                  to="/cron-jobs"
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/cron-jobs')
                      ? 'text-theme-primary-600 dark:text-theme-primary-400 font-bold'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
                  }`}
                >
                  {isActive('/cron-jobs') && (
                    <motion.div
                      layoutId="header-active-nav"
                      className="absolute inset-0 bg-theme-bg-secondary shadow-xs rounded-full border border-theme-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 450, damping: 35 }
                      }
                    />
                  )}
                  <RiTimeLine size={14} className="shrink-0 relative z-10" />
                  <span className="relative z-10">Cron Jobs</span>
                </Link>

                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/super/users"
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isActive('/super/users')
                        ? 'text-theme-primary-600 dark:text-theme-primary-400 font-bold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary'
                    }`}
                  >
                    {isActive('/super/users') && (
                      <motion.div
                        layoutId="header-active-nav"
                        className="absolute inset-0 bg-theme-bg-secondary shadow-xs rounded-full border border-theme-border"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 450, damping: 35 }
                        }
                      />
                    )}
                    <RiShieldUserLine size={14} className="shrink-0 relative z-10" />
                    <span className="relative z-10">Users</span>
                  </Link>
                )}

                {isSelfHosted ? (
                  <a
                    href={ORIGINAL_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-theme-text-secondary hover:text-theme-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <RiBookOpenLine size={14} className="shrink-0" />
                    <span>Docs</span>
                  </a>
                ) : (
                  <Link
                    to="/docs"
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isActive('/docs')
                        ? 'text-theme-primary-600 dark:text-theme-primary-400 font-bold'
                        : 'text-theme-text-secondary hover:text-theme-text-primary'
                    }`}
                  >
                    {isActive('/docs') && (
                      <motion.div
                        layoutId="header-active-nav"
                        className="absolute inset-0 bg-theme-bg-secondary shadow-xs rounded-full border border-theme-border"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 450, damping: 35 }
                        }
                      />
                    )}
                    <RiBookOpenLine size={14} className="shrink-0 relative z-10" />
                    <span className="relative z-10">Docs</span>
                  </Link>
                )}
              </nav>
            )}

            {/* Desktop Navigation for Public Guests */}
            {!user && isPublicHome && (
              <nav className="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-full mx-2 xl:mx-3 shrink-0 border border-theme-border text-xs font-medium text-theme-text-secondary">
                <a
                  href="#features"
                  className="px-3 py-1.5 rounded-full hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                >
                  Features
                </a>
                <a
                  href="#workflow"
                  className="px-3 py-1.5 rounded-full hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                >
                  Workflow
                </a>
                <a
                  href="#comparison"
                  className="px-3 py-1.5 rounded-full hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                >
                  Comparison
                </a>
                <Link
                  to="/docs"
                  className="px-3 py-1.5 rounded-full hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                >
                  Documentation
                </Link>
              </nav>
            )}

            {/* Desktop Right Actions (Theme & Account) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 ml-auto shrink-0">
              <ThemeSwitcher />

              {user ? (
                <>
                  <div className="w-px h-5 bg-theme-border mx-0.5 shrink-0"></div>

                  {/* User Account Popover */}
                  <div className="relative shrink-0" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all focus:outline-none shrink-0 ${
                        isUserMenuOpen
                          ? 'bg-theme-bg-muted border-theme-primary-500/50 shadow-xs'
                          : 'bg-theme-bg-secondary hover:bg-theme-bg-muted border-theme-border'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-theme-primary-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-semibold text-theme-text-primary max-w-[90px] xl:max-w-[120px] truncate">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      <RiArrowDownSLine
                        size={14}
                        className={`text-theme-text-secondary transition-transform duration-200 shrink-0 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border shadow-2xl p-2 z-50 origin-top-right"
                        >
                          <div className="px-3 py-2.5 border-b border-theme-border mb-1">
                            <p className="text-xs font-bold text-theme-text-primary truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-theme-text-muted truncate mt-0.5">
                              {user.email}
                            </p>
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-theme-primary-500/10 text-theme-primary-500 border border-theme-primary-500/20">
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
                            {isSelfHosted ? (
                              <a
                                href={ORIGINAL_DOCS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                              >
                                <RiBookOpenLine size={15} />
                                <span>Documentation</span>
                              </a>
                            ) : (
                              <Link
                                to="/docs"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                              >
                                <RiBookOpenLine size={15} />
                                <span>Documentation</span>
                              </Link>
                            )}
                          </div>

                          <div className="border-t border-theme-border pt-1 mt-1">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/login"
                    className="text-xs text-theme-text-secondary hover:text-theme-text-primary font-medium px-3 py-2 transition-colors whitespace-nowrap shrink-0 rounded-full hover:bg-theme-bg-muted"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-xs !py-2 !px-4 !rounded-full shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0"
                  >
                    <span>Start Free</span>
                    <RiArrowRightLine size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile/Tablet Menu Toggle & Quick Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="hidden sm:flex items-center">
                <ThemeSwitcher />
              </div>

              {user && (
                <button
                  onClick={toggleMenu}
                  className="w-8 h-8 rounded-full bg-theme-primary-500 text-white font-bold text-xs hidden sm:flex items-center justify-center shadow-xs shrink-0 hover:opacity-90 transition-opacity"
                  title="Open navigation menu"
                  aria-label="User navigation menu"
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
              )}

              <button
                onClick={toggleMenu}
                className="text-theme-text-primary hover:text-theme-primary-500 focus:outline-none p-2 -mr-1 transition-colors relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-theme-bg-muted shrink-0"
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
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="lg:hidden flex flex-col w-full overflow-hidden border-t border-theme-border"
              >
                <div className="px-4 pt-3 pb-4 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[75vh]">
                  {user ? (
                    <>
                      {/* Mobile User Header */}
                      <div className="p-3 bg-theme-bg-muted rounded-2xl border border-theme-border mb-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-theme-primary-500 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
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

                      {isSelfHosted ? (
                        <a
                          href={ORIGINAL_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl text-theme-text-primary hover:bg-theme-bg-muted transition-colors"
                        >
                          <RiBookOpenLine size={18} />
                          <span>Docs</span>
                        </a>
                      ) : (
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
                      )}

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
                        className="w-full flex items-center justify-center gap-2 font-bold text-white bg-theme-error hover:opacity-90 px-4 py-3 mt-3 rounded-xl transition-all shadow-sm text-xs active:scale-[0.98]"
                      >
                        <RiLogoutBoxLine size={16} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {isSelfHosted ? (
                        <a
                          href={ORIGINAL_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors"
                        >
                          Docs
                        </a>
                      ) : (
                        <Link
                          to="/docs"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors"
                        >
                          Docs
                        </Link>
                      )}
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-semibold text-theme-text-primary rounded-xl hover:bg-theme-bg-muted hover:text-theme-primary-500 transition-colors"
                      >
                        Log In
                      </Link>

                      <div className="flex items-center justify-between px-4 py-3 border-t border-theme-border mt-2">
                        <div className="text-sm font-medium text-theme-text-secondary">Theme</div>
                        <ThemeSwitcher />
                      </div>

                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn-primary w-full text-center px-4 py-3 mt-3 shadow-sm transition-all active:scale-[0.98]"
                      >
                        <span>Start Building Free</span>
                        <RiArrowRightLine size={16} />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
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
