import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { signupUser, clearError } from "../../store/slices/authSlice";
import { RiErrorWarningLine, RiEyeLine, RiEyeOffLine, RiLoader4Line } from "@remixicon/react";


export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate("/pending");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    dispatch(signupUser({ name, email, password }));
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center relative overflow-hidden transition-colors duration-300 py-12 px-4">
      {/* Background is now handled globally in App.tsx */}

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black tracking-tight text-theme-text-primary drop-shadow-sm mb-2">
            Create Account
          </h2>
          <p className="text-theme-text-secondary font-medium">
            Get started with Vibe Message
          </p>
        </div>

        <div className="backdrop-blur-2xl bg-theme-bg-secondary border border-theme-border rounded-[2rem] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && (
              <div className="bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-800 text-sm font-medium flex items-center gap-3">
                <RiErrorWarningLine size={20} className="shrink-0" />
                {displayError}
              </div>
            )}

            <div className="space-y-5">
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                  placeholder="Full Name"
                  id="name"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                >
                  Full Name
                </label>
              </div>

              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                  placeholder="Email"
                  id="signup-email"
                  required
                />
                <label
                  htmlFor="signup-email"
                  className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                >
                  Email address
                </label>
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-5 pr-12 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                  placeholder="Password"
                  id="signup-password"
                  required
                  minLength={8}
                />
                <label
                  htmlFor="signup-password"
                  className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <RiEyeOffLine size={24} />
                  ) : (
                    <RiEyeLine size={24} />
                  )}
                </button>

                <p className="text-[11px] text-theme-text-muted mt-2 ml-1">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-5 pr-12 py-4 bg-theme-bg-primary text-theme-text-primary border border-theme-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-all placeholder-transparent peer"
                  placeholder="Confirm Password"
                  id="confirm-password"
                  required
                />
                <label
                  htmlFor="confirm-password"
                  className="absolute left-5 top-4 text-theme-text-secondary text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-theme-primary-500 peer-focus:bg-theme-bg-secondary px-1 peer-valid:-top-2.5 peer-valid:text-xs peer-valid:bg-theme-bg-secondary pointer-events-none rounded"
                >
                  Confirm Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-theme-text-muted hover:text-theme-text-primary transition-colors focus:outline-none"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <RiEyeOffLine size={24} />
                  ) : (
                    <RiEyeLine size={24} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-theme-primary-500 hover:bg-theme-primary-600 text-white rounded-2xl font-semibold transform hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RiLoader4Line size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-theme-border pt-6">
            <p className="text-theme-text-secondary font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-theme-primary-500 font-bold hover:text-theme-primary-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
