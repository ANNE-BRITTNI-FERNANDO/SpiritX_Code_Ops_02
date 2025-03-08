import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';

const PlayerStats = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/players/${id}`);
        const data = await response.json();
        setPlayer(data);
      } catch (error) {
        console.error('Error fetching player:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!player) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Player not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {player.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {player.university} - {player.role}
      </Typography>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Batting Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Matches</Typography>
                  <Typography variant="h6">{player.matchesPlayed}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Runs</Typography>
                  <Typography variant="h6">{player.runsScored}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Average</Typography>
                  <Typography variant="h6">{player.battingAverage}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Strike Rate</Typography>
                  <Typography variant="h6">{player.battingStrikeRate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Highest Score</Typography>
                  <Typography variant="h6">{player.highestScore}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">50s/100s</Typography>
                  <Typography variant="h6">{player.fifties}/{player.hundreds}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bowling Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Wickets</Typography>
                  <Typography variant="h6">{player.wicketsTaken}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Economy</Typography>
                  <Typography variant="h6">{player.economyRate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Average</Typography>
                  <Typography variant="h6">{player.bowlingAverage}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Strike Rate</Typography>
                  <Typography variant="h6">{player.bowlingStrikeRate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Best Bowling</Typography>
                  <Typography variant="h6">{player.bestBowling}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Player Value
              </Typography>
              <Typography variant="h4" color="primary">
                ₹{player.value.toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Based on performance points: {player.points}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlayerStats;