import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../api/services";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired - clean up
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      return data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await authService.register(formData);
      toast.success("Account created! Please check your email to verify.");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    }
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
