import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  EmojiEvents as TournamentIcon
} from '@mui/icons-material';
import axios from '../../config/axios';
import PlayersView from './PlayersView';
import PlayerStatsView from './PlayerStatsView';
import SettingsView from './SettingsView';
import TournamentSummary from './TournamentSummary';

const AdminDashboard = ({ onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { text: 'Players', icon: <PeopleIcon />, path: '/admin/dashboard/players' },
    { text: 'Player Stats', icon: <AssessmentIcon />, path: '/admin/dashboard/stats' },
    { text: 'Tournament Summary', icon: <TournamentIcon />, path: '/admin/dashboard/tournament' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/dashboard/settings' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    delete axios.defaults.headers.common['Authorization'];
    onLogout();
  };

  const drawer = (
    <Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Spirit11 Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            marginTop: '64px'
          }
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          marginTop: '64px'
        }}
      >
        <Routes>
          <Route path="players" element={<PlayersView />} />
          <Route path="stats" element={<PlayerStatsView />} />
          <Route path="tournament" element={<TournamentSummary />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<PlayersView />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
