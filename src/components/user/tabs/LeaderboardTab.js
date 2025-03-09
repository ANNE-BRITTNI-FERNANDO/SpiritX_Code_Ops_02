import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import axios from '../../../config/axios';

const formatPrice = (price) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(price);
};

const LeaderboardTab = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/team/leaderboard');
      setLeaderboard(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
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

  if (leaderboard.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            No Teams on Leaderboard Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Teams will appear here once they have selected all 11 players.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Fantasy League Standings
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Username</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Team Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow
                key={entry._id}
                sx={{
                  backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'inherit',
                  '&:nth-of-type(odd)': {
                    backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index < 3 ? 'primary.main' : 'inherit'
                    }}
                  >
                    #{index + 1}
                  </Typography>
                </TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      color: index < 3 ? 'primary.main' : 'inherit'
                    }}
                  >
                    {entry.points.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {formatPrice(entry.teamValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Only teams with all 11 players selected are shown on the leaderboard
      </Typography>
    </Box>
  );
};

export default LeaderboardTab;
