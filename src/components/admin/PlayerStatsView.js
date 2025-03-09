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

  const formatStatValue = (value) => {
    if (value === undefined || value === 'Not Available') return 'Not Available';
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const calculateBattingAverage = (player) => {
    if (player.inningsPlayed === 0) return 0;
    return player.runsScored / player.inningsPlayed;
  };

  const calculateBattingStrikeRate = (player) => {
    if (player.ballsFaced === 0) return 0;
    return (player.runsScored / player.ballsFaced) * 100;
  };

  const calculateBowlingStrikeRate = (player) => {
    if (player.wicketsTaken === 0) return undefined;
    return player.ballsBowled / player.wicketsTaken;
  };

  const calculateBowlingAverage = (player) => {
    if (player.wicketsTaken === 0) return undefined;
    return player.runsConceded / player.wicketsTaken;
  };

  const calculateEconomyRate = (player) => {
    if (player.ballsBowled === 0) return 0;
    const overs = player.ballsBowled / 6;
    return player.runsConceded / overs;
  };

  const calculatePoints = (player) => {
    const battingAverage = calculateBattingAverage(player);
    const battingStrikeRate = calculateBattingStrikeRate(player);
    const economyRate = calculateEconomyRate(player);

    // Calculate batting points: (Batting Strike Rate / 5 + Batting Average × 0.8)
    const battingPoints = (battingStrikeRate / 5) + (battingAverage * 0.8);
    
    // Calculate bowling points
    let bowlingPoints = 0;
    if (player.wicketsTaken > 0) {
      const bowlingStrikeRate = player.ballsBowled / player.wicketsTaken;
      bowlingPoints = (500 / bowlingStrikeRate) + (140 / economyRate);
    } else if (player.ballsBowled > 0) {
      // If no wickets taken but has bowled, only use economy rate component
      bowlingPoints = 140 / economyRate;
    }

    const totalPoints = battingPoints + bowlingPoints;
    return totalPoints;
  };

  const calculateValue = (points) => {
    // Value in Rupees = (9 × Points + 100) × 1000
    const value = (9 * points + 100) * 1000;
    // Round to nearest 50,000
    return Math.round(value / 50000) * 50000;
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
          const avgA = calculateBattingAverage(a);
          const avgB = calculateBattingAverage(b);
          return avgB - avgA;
        });
        break;
      case 'bowlingAverage':
        result.sort((a, b) => {
          const avgA = calculateBowlingAverage(a);
          const avgB = calculateBowlingAverage(b);
          // Put undefined values at the end
          if (avgA === undefined && avgB === undefined) return 0;
          if (avgA === undefined) return 1;
          if (avgB === undefined) return -1;
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

      <Grid container spacing={3}>
        {filteredPlayers.map((player) => {
          const points = calculatePoints(player);
          const value = calculateValue(points);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={player._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {player.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {player.university} • {player.role}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <StatRow label="Matches Played" value={player.matchesPlayed} />
                        <StatRow label="Innings Played" value={player.inningsPlayed} />
                        <StatRow label="Runs Scored" value={player.runsScored} />
                        <StatRow label="Balls Faced" value={player.ballsFaced} />
                        <StatRow label="Batting Average" value={formatStatValue(calculateBattingAverage(player))} />
                        <StatRow label="Batting Strike Rate" value={formatStatValue(calculateBattingStrikeRate(player))} />
                        <StatRow label="Wickets Taken" value={player.wicketsTaken} />
                        <StatRow label="Balls Bowled" value={player.ballsBowled} />
                        <StatRow label="Runs Conceded" value={player.runsConceded} />
                        <StatRow label="Bowling Strike Rate" value={formatStatValue(calculateBowlingStrikeRate(player))} />
                        <StatRow label="Bowling Average" value={formatStatValue(calculateBowlingAverage(player))} />
                        <StatRow label="Points" value={formatStatValue(points)} />
                        <StatRow label="Value" value={formatPrice(value)} />
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PlayerStatsView;
