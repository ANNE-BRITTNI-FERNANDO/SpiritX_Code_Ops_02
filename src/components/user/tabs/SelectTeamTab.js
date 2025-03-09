import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from '../../../config/axios';

const formatPrice = (price) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(price);
};

const PlayerCard = ({ player, onSelect, isSelected, disabled }) => (
  <Card 
    sx={{ 
      position: 'relative',
      opacity: disabled ? 0.7 : 1,
      '&:hover': { boxShadow: disabled ? 1 : 6 }
    }}
  >
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {player.name}
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        {player.university}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Box>
          <Typography variant="subtitle1" color="primary">
            {formatPrice(player.price)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {player.role}
          </Typography>
        </Box>
        <Button
          variant={isSelected ? "outlined" : "contained"}
          color={isSelected ? "error" : "primary"}
          size="small"
          onClick={() => onSelect(player)}
          disabled={disabled && !isSelected}
        >
          {isSelected ? "Remove" : "Select"}
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const SelectTeamTab = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRole, setCurrentRole] = useState('batsman');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [budget, setBudget] = useState(9000000);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPlayers();
    fetchUserTeam();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeam = async () => {
    try {
      const response = await axios.get('/api/team/myteam');
      if (response.data && response.data.players) {
        setSelectedPlayers(response.data.players);
        // Calculate remaining budget
        const usedBudget = response.data.players.reduce((sum, player) => sum + player.price, 0);
        setBudget(9000000 - usedBudget);
      }
    } catch (err) {
      console.error('Error fetching user team:', err);
      setError('Failed to load your team');
    }
  };

  const handleRoleChange = (event, newRole) => {
    setCurrentRole(newRole);
  };

  const validateTeamComposition = () => {
    const batsmenCount = selectedPlayers.filter(p => p.role === 'Batsman').length;
    const bowlersCount = selectedPlayers.filter(p => p.role === 'Bowler').length;
    const allRoundersCount = selectedPlayers.filter(p => p.role === 'All-rounder').length;
    const wicketKeepersCount = selectedPlayers.filter(p => p.role === 'WicketKeeper').length;
    
    // Total players should be 11
    if (selectedPlayers.length > 11) {
      return { valid: false, message: 'Team cannot have more than 11 players' };
    }

    // Check individual role limits
    if (batsmenCount > 5) {
      return { valid: false, message: 'Team cannot have more than 5 batsmen' };
    }
    if (bowlersCount > 4) {
      return { valid: false, message: 'Team cannot have more than 4 bowlers' };
    }
    if (allRoundersCount > 2) {
      return { valid: false, message: 'Team cannot have more than 2 all-rounders' };
    }
    if (wicketKeepersCount > 1) {
      return { valid: false, message: 'Team cannot have more than 1 wicket keeper' };
    }

    return { valid: true };
  };

  const validateRoleLimit = (role) => {
    const roleCount = selectedPlayers.filter(p => p.role === role).length;
    switch (role) {
      case 'Batsman':
        return roleCount < 5;
      case 'Bowler':
        return roleCount < 4;
      case 'All-rounder':
        return roleCount < 2;
      case 'WicketKeeper':
        return roleCount < 1;
      default:
        return false;
    }
  };

  const handlePlayerSelect = async (player) => {
    try {
      if (isPlayerSelected(player._id)) {
        // Remove player
        const response = await axios.delete(`/api/team/remove-player/${player._id}`);
        if (response.data) {
          setSelectedPlayers(response.data.players);
          setBudget(9000000 - response.data.players.reduce((sum, p) => sum + p.price, 0));
        }
      } else {
        // Validate budget
        if (player.price > budget) {
          showErrorDialog('Not enough budget to select this player');
          return;
        }

        // Validate team size and role limits
        if (selectedPlayers.length >= 11) {
          showErrorDialog('Team is already full (11 players maximum)');
          return;
        }

        // Check role-specific limits
        if (!validateRoleLimit(player.role)) {
          const limits = {
            'Batsman': 5,
            'Bowler': 4,
            'All-rounder': 2,
            'WicketKeeper': 1
          };
          showErrorDialog(`Cannot select more than ${limits[player.role]} ${player.role}${player.role !== 'WicketKeeper' ? 's' : ''}`);
          return;
        }

        // Add player
        const response = await axios.post(`/api/team/add-player/${player._id}`);
        if (response.data) {
          const newSelectedPlayers = response.data.players;
          
          // Validate final team composition
          const compositionValidation = validateTeamComposition();
          if (!compositionValidation.valid) {
            // Revert the addition if it violates team composition rules
            await axios.delete(`/api/team/remove-player/${player._id}`);
            showErrorDialog(compositionValidation.message);
            return;
          }

          setSelectedPlayers(newSelectedPlayers);
          setBudget(9000000 - newSelectedPlayers.reduce((sum, p) => sum + p.price, 0));
        }
      }
    } catch (err) {
      console.error('Error updating team:', err);
      showErrorDialog(err.response?.data?.message || 'Failed to update team');
    }
  };

  const isPlayerSelected = (playerId) => {
    return selectedPlayers.some(p => p._id === playerId);
  };

  const showErrorDialog = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const TeamCompositionSummary = () => {
    const batsmenCount = selectedPlayers.filter(p => p.role === 'Batsman').length;
    const bowlersCount = selectedPlayers.filter(p => p.role === 'Bowler').length;
    const allRoundersCount = selectedPlayers.filter(p => p.role === 'All-rounder').length;
    const wicketKeepersCount = selectedPlayers.filter(p => p.role === 'WicketKeeper').length;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Team Composition ({selectedPlayers.length}/11 players)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Batsmen: ${batsmenCount}/5`} color={batsmenCount <= 5 ? "primary" : "error"} />
          <Chip label={`Bowlers: ${bowlersCount}/4`} color={bowlersCount <= 4 ? "primary" : "error"} />
          <Chip label={`All-rounders: ${allRoundersCount}/2`} color={allRoundersCount <= 2 ? "primary" : "error"} />
          <Chip label={`Wicket Keeper: ${wicketKeepersCount}/1`} color={wicketKeepersCount <= 1 ? "primary" : "error"} />
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const filteredPlayers = players.filter(player => 
    player.role.toLowerCase() === currentRole.toLowerCase()
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Select Your Team
        </Typography>
        <Typography variant="h6" color="primary">
          Budget: {formatPrice(budget)}
        </Typography>
      </Box>

      <TeamCompositionSummary />

      <Tabs
        value={currentRole}
        onChange={handleRoleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Batsmen" value="batsman" />
        <Tab label="Bowlers" value="bowler" />
        <Tab label="All Rounders" value="all-rounder" />
        <Tab label="Wicket Keepers" value="wicketkeeper" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredPlayers.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player._id}>
            <PlayerCard
              player={player}
              onSelect={handlePlayerSelect}
              isSelected={isPlayerSelected(player._id)}
              disabled={!isPlayerSelected(player._id) && (
                player.price > budget || 
                (selectedPlayers.length >= 11) ||
                !validateRoleLimit(player.role)
              )}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={showError} onClose={() => setShowError(false)}>
        <DialogTitle>Selection Error</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowError(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SelectTeamTab;
