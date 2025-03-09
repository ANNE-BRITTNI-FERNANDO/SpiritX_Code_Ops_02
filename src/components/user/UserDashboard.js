import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExitToApp as LogoutIcon, SportsCricket as CricketIcon, SmartToy } from '@mui/icons-material';
import PlayersTab from './tabs/PlayersTab';
import SelectTeamTab from './tabs/SelectTeamTab';
import MyTeamTab from './tabs/MyTeamTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import BudgetTab from './tabs/BudgetTab';
import ChatbotTab from './tabs/ChatbotTab';

const UserDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [budget, setBudget] = useState(9000000); // Initial budget of 9M
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handlePlayerSelect = (player) => {
    // Check if player is already selected
    if (selectedPlayers.some(p => p._id === player._id)) {
      return false;
    }

    // Check budget
    if (player.price > budget) {
      return false;
    }

    // Check team size
    if (selectedPlayers.length >= 11) {
      return false;
    }

    setSelectedPlayers([...selectedPlayers, player]);
    setBudget(budget - player.price);
    return true;
  };

  const handlePlayerRemove = (player) => {
    setSelectedPlayers(selectedPlayers.filter(p => p._id !== player._id));
    setBudget(budget + player.price);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <PlayersTab />;
      case 1:
        return (
          <SelectTeamTab 
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={selectedPlayers}
            remainingBudget={budget}
          />
        );
      case 2:
        return (
          <MyTeamTab 
            selectedPlayers={selectedPlayers}
            onPlayerRemove={handlePlayerRemove}
            budget={budget}
          />
        );
      case 3:
        return <BudgetTab />;
      case 4:
        return <LeaderboardTab />;
      case 5:
        return <ChatbotTab />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <CricketIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spirit11 - Fantasy Cricket
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              Welcome, {username}!
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Players" />
            <Tab label="Select Team" />
            <Tab 
              label={
                <Badge 
                  badgeContent={`${selectedPlayers.length}/11`} 
                  color={selectedPlayers.length === 11 ? "success" : "primary"}
                >
                  My Team
                </Badge>
              } 
            />
            <Tab label="Budget" />
            <Tab label="Leaderboard" />
            <Tab 
              icon={<SmartToy />} 
              iconPosition="start" 
              label="Spiriter" 
            />
          </Tabs>
        </Paper>

        {renderTabContent()}
      </Container>
    </Box>
  );
};

export default UserDashboard;
