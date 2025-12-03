import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Message from './Message';
import './Auth.css';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingEmail, setPendingEmail } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from location state or context
    const emailFromState = location.state?.email || pendingEmail;
    if (emailFromState) {
      setEmail(emailFromState);
      if (pendingEmail) setPendingEmail(emailFromState);
    } else {
      // If no email, redirect to login
      navigate('/login');
    }
  }, [location, pendingEmail, setPendingEmail, navigate]);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setErrors({});

    // Validation
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'OTP verified successfully! Redirecting...' });
      setTimeout(() => {
        navigate('/transactions');
      }, 1000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
        <Message type={message.type} message={message.text} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={handleChange}
              className={errors.otp ? 'error' : ''}
              placeholder="000000"
              maxLength="6"
              required
              autoFocus
            />
            {errors.otp && <span className="error-text">{errors.otp}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          Didn't receive the code? Check your spam folder or try logging in again.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;

