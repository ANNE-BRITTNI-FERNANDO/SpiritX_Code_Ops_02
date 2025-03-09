import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from '../../../config/axios';

const PlayerStats = ({ player }) => (
  <TableContainer>
    <Table size="small">
      <TableBody>
        <TableRow>
          <TableCell component="th">University</TableCell>
          <TableCell>{player.university}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Role</TableCell>
          <TableCell>{player.role}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Matches</TableCell>
          <TableCell>{player.matchesPlayed}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Runs</TableCell>
          <TableCell>{player.runsScored}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Wickets</TableCell>
          <TableCell>{player.wicketsTaken}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
);

const PlayersTab = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
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

  return (
    <Box>
      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => setSelectedPlayer(player)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {player.name}
                </Typography>
                <Typography color="textSecondary">
                  {player.role} • {player.university}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={Boolean(selectedPlayer)} 
        onClose={() => setSelectedPlayer(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPlayer && (
          <>
            <DialogTitle>
              {selectedPlayer.name}
            </DialogTitle>
            <DialogContent>
              <PlayerStats player={selectedPlayer} />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PlayersTab;
