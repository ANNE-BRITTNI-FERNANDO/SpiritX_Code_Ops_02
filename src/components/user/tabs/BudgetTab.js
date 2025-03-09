import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import axios from '../../../config/axios';

const INITIAL_BUDGET = 9000000;

const BudgetTab = () => {
  const [team, setTeam] = useState([]);
  const [budget, setBudget] = useState({
    total: INITIAL_BUDGET,
    spent: 0,
    remaining: INITIAL_BUDGET
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axios.get('/api/team/myteam');
      if (response.data && response.data.players) {
        setTeam(response.data.players);
        
        // Calculate spent budget
        const spentBudget = response.data.players.reduce((total, player) => total + (player.price || 0), 0);
        setBudget({
          total: INITIAL_BUDGET,
          spent: spentBudget,
          remaining: INITIAL_BUDGET - spentBudget
        });
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getBudgetUsagePercentage = () => {
    return (budget.spent / budget.total) * 100;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(budget.total)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Spent
                  </Typography>
                  <Typography variant="h6" color="error">
                    {formatPrice(budget.spent)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Remaining
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatPrice(budget.remaining)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getBudgetUsagePercentage()} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: budget.remaining < 0 ? 'error.main' : 'primary.main'
                        }
                      }}
                    />
                    <Typography variant="body2" color="textSecondary" align="right" sx={{ mt: 1 }}>
                      {`${getBudgetUsagePercentage().toFixed(1)}% Used`}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell>University</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {team.map((player) => (
                  <TableRow key={player._id}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.university}</TableCell>
                    <TableCell>{player.role}</TableCell>
                    <TableCell align="right">{formatPrice(player.price || 0)}</TableCell>
                  </TableRow>
                ))}
                {team.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="textSecondary">
                        No players in your team yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetTab;
