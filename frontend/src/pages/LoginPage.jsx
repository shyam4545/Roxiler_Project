import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'STORE_OWNER') navigate('/owner/dashboard');
      else navigate('/user/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⭐</div>
          <h1>RateMyStore</h1>
          <p>Sign in to your account</p>
        </div>

        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <div className="form-error">⚠️ {errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Your password"
              {...register('password')}
            />
            {errors.password && <div className="form-error">⚠️ {errors.password.message}</div>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
