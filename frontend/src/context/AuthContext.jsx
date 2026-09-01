import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check active session
  const checkAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, loginRole) => {
    setLoading(true);
    try {
      const result = await authApi.login(email, password, loginRole);
      // Fetch details of user
      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setRole(currentUser.role);
      }
      return result;
    } catch (error) {
      console.error("Login action error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (role) {
        await authApi.logout(role);
      }
    } catch (error) {
      console.error("Logout action error:", error);
    } finally {
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const forgotPassword = async (email, forgotRole) => {
    return await authApi.forgotPassword(email, forgotRole);
  };

  const verifyOtp = async (email, otp, otpRole) => {
    return await authApi.verifyOtp(email, otp, otpRole);
  };

  const resetPassword = async (email, otp, newPassword, resetRole) => {
    return await authApi.resetPassword(email, otp, newPassword, resetRole);
  };

  const resetPasswordFirstLogin = async (email, currentPassword, newPassword, resetRole) => {
    const result = await authApi.resetPasswordFirstLogin(email, currentPassword, newPassword, resetRole);
    // Refresh auth state after successful first login password reset so user becomes fully active
    await checkAuth();
    return result;
  };

  const signupAdmin = async (companyName, name, email, password) => {
    return await authApi.signupAdmin(companyName, name, email, password);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      login,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword,
      resetPasswordFirstLogin,
      signupAdmin,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
