import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, Loader, KeyRound, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, resetPasswordFirstLogin } = useAuth();

  const [email] = useState(location.state?.email || '');
  const [role] = useState(location.state?.role || 'employee');
  
  // Input fields state
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const isFirstLogin = location.state?.isFirstLogin || false;

  const validateForm = () => {
    const errors = {};
    
    if (isFirstLogin) {
      if (!currentPassword) {
        errors.currentPassword = 'Temporary password is required';
      }
    } else {
      if (!otp) {
        errors.otp = 'OTP code is required';
      }
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isFirstLogin) {
        await resetPasswordFirstLogin(email, currentPassword, newPassword, role);
        setSuccess(true);
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        await resetPassword(email, otp, newPassword, role);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Failed to update password. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-indigo-900/30 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div>
          {!isFirstLogin && (
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          )}
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            {isFirstLogin ? 'Set Initial Password' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isFirstLogin 
              ? 'Please define a secure password for your first login'
              : `Enter the security OTP code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            {isFirstLogin 
              ? 'Initial password set successfully! Loading workspace...'
              : 'Password updated successfully! Redirecting to login page...'}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 rounded-md shadow-sm">
            
            {/* Conditional input fields: Current Temp Password for First Login OR OTP Code for Forgot Password */}
            {isFirstLogin ? (
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300">
                  Current Temporary Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`block w-full rounded-lg border bg-slate-900 pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm ${
                      validationErrors.currentPassword ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="Enter temporary password"
                  />
                </div>
                {validationErrors.currentPassword && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.currentPassword}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-300">
                  OTP Verification Code
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`block w-full rounded-lg border bg-slate-900 pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm ${
                      validationErrors.otp ? 'border-red-500' : 'border-slate-800'
                    }`}
                    placeholder="Enter 6-digit OTP code"
                  />
                </div>
                {validationErrors.otp && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.otp}</p>
                )}
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                New Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`block w-full rounded-lg border bg-slate-900 pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm ${
                    validationErrors.newPassword ? 'border-red-500' : 'border-slate-800'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="mt-1 text-xs text-red-400">{validationErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full rounded-lg border bg-slate-900 pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-800'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  Updating Password...
                </span>
              ) : (
                isFirstLogin ? 'Set Password' : 'Reset Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
