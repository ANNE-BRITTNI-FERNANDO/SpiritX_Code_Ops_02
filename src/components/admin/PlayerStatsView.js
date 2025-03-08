import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from '../../config/axios';

const StatRow = ({ label, value }) => (
  <TableRow>
    <TableCell component="th" scope="row">{label}</TableCell>
    <TableCell align="right">{value}</TableCell>
  </TableRow>
);

const PlayerStatsView = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    university: '',
    sortBy: 'name'
  });
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [players, filters]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('/api/players');
      setPlayers(response.data);
      // Extract unique universities
      const uniqueUniversities = [...new Set(response.data.map(p => p.university))];
      setUniversities(uniqueUniversities);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...players];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(player =>
        player.name.toLowerCase().includes(searchLower) ||
        player.university.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter(player => player.role === filters.role);
    }

    // Apply university filter
    if (filters.university) {
      result = result.filter(player => player.university === filters.university);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'runsScored':
        result.sort((a, b) => b.runsScored - a.runsScored);
        break;
      case 'wicketsTaken':
        result.sort((a, b) => b.wicketsTaken - a.wicketsTaken);
        break;
      case 'battingAverage':
        result.sort((a, b) => {
          const avgA = a.inningsPlayed > 0 ? a.runsScored / a.inningsPlayed : 0;
          const avgB = b.inningsPlayed > 0 ? b.runsScored / b.inningsPlayed : 0;
          return avgB - avgA;
        });
        break;
      case 'bowlingAverage':
        result.sort((a, b) => {
          const avgA = a.wicketsTaken > 0 ? a.runsConceded / a.wicketsTaken : Infinity;
          const avgB = b.wicketsTaken > 0 ? b.runsConceded / b.wicketsTaken : Infinity;
          return avgA - avgB;
        });
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredPlayers(result);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      university: '',
      sortBy: 'name'
    });
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
      <Typography variant="h5" component="h2" gutterBottom>
        Player Statistics
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Players"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  label="Role"
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="Batsman">Batsman</MenuItem>
                  <MenuItem value="Bowler">Bowler</MenuItem>
                  <MenuItem value="AllRounder">AllRounder</MenuItem>
                  <MenuItem value="WicketKeeper">WicketKeeper</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>University</InputLabel>
                <Select
                  value={filters.university}
                  label="University"
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                >
                  <MenuItem value="">All Universities</MenuItem>
                  {universities.map(uni => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="runsScored">Runs Scored</MenuItem>
                  <MenuItem value="wicketsTaken">Wickets Taken</MenuItem>
                  <MenuItem value="battingAverage">Batting Average</MenuItem>
                  <MenuItem value="bowlingAverage">Bowling Average</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {filteredPlayers.map((player) => (
        <Card key={player._id} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* General Information */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="primary" gutterBottom>
                  General Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <StatRow label="Name" value={player.name} />
                      <StatRow label="University" value={player.university} />
                      <StatRow label="Role" value={player.role} />
                      <StatRow label="Matches Played" value={player.matchesPlayed} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Batting Statistics */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Batting Statistics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <StatRow label="Total Runs" value={player.runsScored} />
                      <StatRow 
                        label="Batting Average" 
                        value={player.inningsPlayed > 0 
                          ? (player.runsScored / player.inningsPlayed).toFixed(2) 
                          : 'N/A'} 
                      />
                      <StatRow 
                        label="Strike Rate" 
                        value={player.ballsFaced > 0 
                          ? ((player.runsScored / player.ballsFaced) * 100).toFixed(2) 
                          : 'N/A'} 
                      />
                      <StatRow label="Balls Faced" value={player.ballsFaced} />
                      <StatRow label="Innings Played" value={player.inningsPlayed} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Bowling Statistics */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Bowling Statistics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <StatRow label="Wickets" value={player.wicketsTaken} />
                      <StatRow 
                        label="Bowling Average" 
                        value={player.wicketsTaken > 0 
                          ? (player.runsConceded / player.wicketsTaken).toFixed(2) 
                          : 'N/A'} 
                      />
                      <StatRow 
                        label="Economy Rate" 
                        value={player.oversBowled > 0 
                          ? (player.runsConceded / player.oversBowled).toFixed(2) 
                          : 'N/A'} 
                      />
                      <StatRow label="Overs Bowled" value={player.oversBowled} />
                      <StatRow label="Runs Conceded" value={player.runsConceded} />
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PlayerStatsView;
