import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { useNotifications } from "../../context/NotificationContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const { requestPermission, permissionStatus } = useNotifications();

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on user status after successful login
    if (user) {
      // Request notification permission on login (user gesture)
      if (permissionStatus === "default") {
        requestPermission();
      }

      if (user.status === "PENDING") {
        navigate("/pending");
      } else if (user.status === "BANNED") {
        // Error will be shown from Redux state
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate, permissionStatus, requestPermission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-theme-bg-primary transition-colors duration-300 py-12 px-4">
      <div className="max-w-md w-full relative">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-theme-primary-500/20 dark:bg-theme-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-theme-text-primary">Welcome Back</h2>
          <p className="text-theme-text-secondary mt-2">Sign in to your account</p>
        </div>

        <div className="card relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800/30">
                {error}
              </div>
            )}

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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-theme-text-secondary">
              Don't have an account?{" "}
              <Link to="/signup" className="text-theme-primary-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
