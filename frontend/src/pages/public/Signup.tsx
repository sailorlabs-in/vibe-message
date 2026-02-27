import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { signupUser, clearError } from "../../store/slices/authSlice";

export const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to pending page after successful signup
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg-primary transition-colors duration-300 py-12 px-4">
      <div className="max-w-md w-full relative">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-theme-primary-500/20 dark:bg-theme-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-theme-text-primary">Create Account</h2>
          <p className="text-theme-text-secondary mt-2">Get started with Vibe Message</p>
        </div>

        <div className="card relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {displayError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800/30">
                {displayError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                minLength={8}
              />
              <p className="text-xs text-theme-text-secondary mt-1">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-theme-text-primary">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-theme-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-theme-primary-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
