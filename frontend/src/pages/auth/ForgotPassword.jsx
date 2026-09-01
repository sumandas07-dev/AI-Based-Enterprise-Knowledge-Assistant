import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader, Shield, User } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState(location.state?.role || 'employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email, role);
      setSuccess(true);
      // Wait a moment and navigate to reset password page
      setTimeout(() => {
        navigate('/reset-password', { state: { email, role } });
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Failed to initiate password reset. Please verify your email and role selection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-indigo-900/30 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email to receive a password reset OTP code
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            OTP code sent successfully! Redirecting to verification...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Role Selection Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Account Role
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-900 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                    role === 'employee'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                    role === 'admin'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Administrator
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm"
                  placeholder="name@enterprise.com"
                />
              </div>
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
                  Sending OTP...
                </span>
              ) : (
                'Request Reset Link'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
