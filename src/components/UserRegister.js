import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  LinearProgress, 
  Dialog,
  DialogContent, 
  DialogTitle,
  Alert
} from '@mui/material';
import axios from '../config/axios';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: -1
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 8) return 'Username must be at least 8 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
        if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain a number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain a special character';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Real-time validation
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value),
      submit: '' // Clear submit error when user types
    }));

    // Validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', formData.confirmPassword)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      if (errorMessage.includes('username')) {
        setErrors(prev => ({ ...prev, username: 'Username already exists' }));
      } else {
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer component="main" maxWidth="xs">
      <Box sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <StyledPaper elevation={3}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Your Account
          </Typography>
          
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />

            {formData.password && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={passwordStrength}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 
                        passwordStrength <= 40 ? '#f44336' :
                        passwordStrength <= 70 ? '#ff9800' : '#4caf50',
                    },
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Password Strength: {
                    passwordStrength <= 40 ? 'Weak' :
                    passwordStrength <= 70 ? 'Medium' : 'Strong'
                  }
                </Typography>
              </Box>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Sign Up
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Button 
                onClick={() => navigate('/login')} 
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                Login here
              </Button>
            </Typography>
          </Box>
        </StyledPaper>
      </Box>

      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
        <DialogTitle>Registration Successful!</DialogTitle>
        <DialogContent>
          <Typography>
            Your account has been created successfully. Redirecting to login...
          </Typography>
        </DialogContent>
      </Dialog>
    </StyledContainer>
  );
};

export default UserRegister;