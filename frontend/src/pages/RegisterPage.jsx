import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const registerSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must be at most 16 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    const { confirmPassword, ...payload } = data;
    try {
      await api.post('/auth/register', payload);
      setSuccess('Account created! Redirecting to login...');
      reset();
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-icon">⭐</div>
          <h1>Create Account</h1>
          <p>Join RateMyStore today</p>
        </div>

        {serverError && <div className="alert alert-error">⚠️ {serverError}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="At least 20 characters required"
              {...register('name')}
            />
            {errors.name ? (
              <div className="form-error">⚠️ {errors.name.message}</div>
            ) : (
              <div className="form-hint">Min 20, Max 60 characters</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <div className="form-error">⚠️ {errors.email.message}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-address">Address</label>
            <textarea
              id="reg-address"
              className={`form-control ${errors.address ? 'error' : ''}`}
              placeholder="Your full address"
              rows={3}
              {...register('address')}
              style={{ resize: 'vertical' }}
            />
            {errors.address ? (
              <div className="form-error">⚠️ {errors.address.message}</div>
            ) : (
              <div className="form-hint">Max 400 characters</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="8–16 chars, 1 uppercase, 1 special char"
              {...register('password')}
            />
            {errors.password ? (
              <div className="form-error">⚠️ {errors.password.message}</div>
            ) : (
              <div className="form-hint">8–16 characters, uppercase + special character required</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <div className="form-error">⚠️ {errors.confirmPassword.message}</div>
            )}
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
