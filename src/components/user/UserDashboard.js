import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';

const UserDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spirit11 User Dashboard
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome{username ? `, ${username}` : ''}!
          </Typography>
          <Typography variant="body1" paragraph>
            This is your user dashboard. You can view tournament statistics and player information here.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserDashboard;
