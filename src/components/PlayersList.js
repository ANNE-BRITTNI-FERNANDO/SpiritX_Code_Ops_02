import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const PlayersList = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    role: 'Batsman',
    matchesPlayed: 0,
    runsScored: 0,
    wicketsTaken: 0
  });

  useEffect(() => {
    const socket = io('http://localhost:5000');
    fetchPlayers();

    socket.on('playerUpdated', ({ action, player, playerId }) => {
      if (action === 'create') {
        setPlayers(prev => [...prev, player]);
      } else if (action === 'update') {
        setPlayers(prev => prev.map(p => p._id === player._id ? player : p));
      } else if (action === 'delete') {
        setPlayers(prev => prev.filter(p => p._id !== playerId));
      }
    });

    return () => socket.disconnect();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players');
      setPlayers(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch players', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (player = null) => {
    if (player) {
      setFormData({
        name: player.name,
        university: player.university,
        role: player.role,
        matchesPlayed: player.matchesPlayed,
        runsScored: player.runsScored,
        wicketsTaken: player.wicketsTaken
      });
      setSelectedPlayer(player);
    } else {
      setFormData({
        name: '',
        university: '',
        role: 'Batsman',
        matchesPlayed: 0,
        runsScored: 0,
        wicketsTaken: 0
      });
      setSelectedPlayer(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlayer(null);
    setFormData({
      name: '',
      university: '',
      role: 'Batsman',
      matchesPlayed: 0,
      runsScored: 0,
      wicketsTaken: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlayer) {
        await axios.put(`http://localhost:5000/api/players/${selectedPlayer._id}`, formData);
        showSnackbar('Player updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/players', formData);
        showSnackbar('Player created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await axios.delete(`http://localhost:5000/api/players/${playerId}`);
        showSnackbar('Player deleted successfully');
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Delete failed', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Players List</Typography>
        {admin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Player
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Matches</TableCell>
              <TableCell align="right">Runs</TableCell>
              <TableCell align="right">Wickets</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Value</TableCell>
              {admin && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {players
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((player) => (
                <TableRow
                  key={player._id}
                  hover
                  onClick={() => navigate(`/admin/player/${player._id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.university}</TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell align="right">{player.matchesPlayed}</TableCell>
                  <TableCell align="right">{player.runsScored}</TableCell>
                  <TableCell align="right">{player.wicketsTaken}</TableCell>
                  <TableCell align="right">{player.points}</TableCell>
                  <TableCell align="right">
                    ₹{player.value.toLocaleString()}
                  </TableCell>
                  {admin && (
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(player);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(player._id);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={players.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPlayer ? 'Edit Player' : 'Add New Player'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="University"
              name="university"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              margin="normal"
              required
            >
              {['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'].map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Matches Played"
              name="matchesPlayed"
              value={formData.matchesPlayed}
              onChange={(e) => setFormData({ ...formData, matchesPlayed: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Runs Scored"
              name="runsScored"
              value={formData.runsScored}
              onChange={(e) => setFormData({ ...formData, runsScored: parseInt(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Wickets Taken"
              name="wicketsTaken"
              value={formData.wicketsTaken}
              onChange={(e) => setFormData({ ...formData, wicketsTaken: parseInt(e.target.value) })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPlayer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default PlayersList;