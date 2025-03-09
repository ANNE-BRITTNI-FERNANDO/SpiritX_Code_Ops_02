import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import axios from '../../../config/axios';

const formatPrice = (price) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(price);
};

const PlayerCard = ({ player }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {player.name}
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        {player.university}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Role: {player.role}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="primary">
            Value: {formatPrice(player.price || 0)}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const MyTeamTab = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/team/myteam');
      setTeam(response.data);
    } catch (err) {
      console.error('Error fetching team:', err);
      setError(err.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
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

  if (!team || !team.players || team.players.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        You haven't selected any players yet. Go to the Select Team tab to build your team!
      </Alert>
    );
  }

  const totalValue = team.players.reduce((sum, player) => sum + (player.price || 0), 0);
  const isTeamComplete = team.players.length === 11;

  const TeamCompositionSummary = ({ players }) => {
    const batsmenCount = players.filter(p => p.role === 'Batsman').length;
    const bowlersCount = players.filter(p => p.role === 'Bowler').length;
    const allRoundersCount = players.filter(p => p.role === 'All-rounder').length;
    const wicketKeepersCount = players.filter(p => p.role === 'WicketKeeper').length;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Team Composition ({players.length}/11 players)
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

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Team Value: {formatPrice(totalValue)}
        </Typography>
        <Typography variant="h6" color={isTeamComplete ? "success.main" : "primary"}>
          {team.players.length}/11 Players
        </Typography>
      </Box>

      <TeamCompositionSummary players={team.players} />

      {!isTeamComplete && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your team must have:
          • Up to 5 batsmen
          • Up to 4 bowlers
          • Up to 2 all-rounders
          • Optional 1 wicket keeper
          • Total of 11 players
        </Alert>
      )}

      <Grid container spacing={3}>
        {team.players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player._id}>
            <PlayerCard player={player} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyTeamTab;
