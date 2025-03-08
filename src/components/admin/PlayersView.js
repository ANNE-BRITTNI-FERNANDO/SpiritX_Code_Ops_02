import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from '../../config/axios';  

const PlayerForm = ({ open, player, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    role: '',
    matchesPlayed: 0,
    runsScored: 0,
    ballsFaced: 0,
    inningsPlayed: 0,
    wicketsTaken: 0,
    oversBowled: 0,
    runsConceded: 0,
    ...player
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {player ? 'Edit Player' : 'Add New Player'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="University"
                name="university"
                value={formData.university}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="Batsman">Batsman</MenuItem>
                <MenuItem value="Bowler">Bowler</MenuItem>
                <MenuItem value="AllRounder">AllRounder</MenuItem>
                <MenuItem value="WicketKeeper">WicketKeeper</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Matches Played"
                name="matchesPlayed"
                value={formData.matchesPlayed}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Runs"
                name="runsScored"
                value={formData.runsScored}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Balls Faced"
                name="ballsFaced"
                value={formData.ballsFaced}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Innings Played"
                name="inningsPlayed"
                value={formData.inningsPlayed}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Wickets"
                name="wicketsTaken"
                value={formData.wicketsTaken}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Overs Bowled"
                name="oversBowled"
                value={formData.oversBowled}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Runs Conceded"
                name="runsConceded"
                value={formData.runsConceded}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const PlayersView = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
      setFilteredPlayers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (playerData) => {
    try {
      await axios.post('/api/players', playerData);
      fetchPlayers();
      setFormOpen(false);
    } catch (err) {
      console.error('Error adding player:', err);
      setError('Failed to add player');
    }
  };

  const handleUpdatePlayer = async (playerId, playerData) => {
    try {
      await axios.put(`/api/players/${playerId}`, playerData);
      fetchPlayers();
      setFormOpen(false);
    } catch (err) {
      console.error('Error updating player:', err);
      setError('Failed to update player');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await axios.delete(`/api/players/${playerId}`);
      fetchPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
      setError('Failed to delete player');
    }
  };

  const handleEdit = (player) => {
    setSelectedPlayer(player);
    setFormOpen(true);
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      await axios.delete(`/api/players/${playerId}`);
      setSnackbar({
        open: true,
        message: 'Player deleted successfully',
        severity: 'success'
      });
      fetchPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete player',
        severity: 'error'
      });
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedPlayer) {
        await handleUpdatePlayer(selectedPlayer._id, formData);
      } else {
        await handleAddPlayer(formData);
      }
      setSnackbar({
        open: true,
        message: `Player ${selectedPlayer ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      setFormOpen(false);
      setSelectedPlayer(null);
    } catch (err) {
      console.error('Error saving player:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${selectedPlayer ? 'update' : 'add'} player: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedPlayer(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Players Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Player
        </Button>
      </Box>

      {error ? (
        <Typography color="error" variant="h6" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>University</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Matches</TableCell>
                <TableCell align="right">Innings</TableCell>
                <TableCell align="right">Runs</TableCell>
                <TableCell align="right">Balls Faced</TableCell>
                <TableCell align="right">Wickets</TableCell>
                <TableCell align="right">Overs</TableCell>
                <TableCell align="right">Runs Conceded</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player._id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.university}</TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell align="right">{player.matchesPlayed}</TableCell>
                  <TableCell align="right">{player.inningsPlayed}</TableCell>
                  <TableCell align="right">{player.runsScored}</TableCell>
                  <TableCell align="right">{player.ballsFaced}</TableCell>
                  <TableCell align="right">{player.wicketsTaken}</TableCell>
                  <TableCell align="right">{player.oversBowled}</TableCell>
                  <TableCell align="right">{player.runsConceded}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(player)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(player._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PlayerForm
        open={formOpen}
        player={selectedPlayer}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlayersView;
