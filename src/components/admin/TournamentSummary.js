import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from '../../config/axios';

const TournamentSummary = () => {
  const [summary, setSummary] = useState({
    totalRuns: 0,
    totalWickets: 0,
    highestScorer: { name: '', runs: 0 },
    highestWicketTaker: { name: '', wickets: 0 },
    topScorers: [],
    topWicketTakers: []
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/players');
      const players = response.data;
      
      // Calculate summary
      const summaryData = {
        totalRuns: players.reduce((sum, p) => sum + p.runsScored, 0),
        totalWickets: players.reduce((sum, p) => sum + p.wicketsTaken, 0),
        highestScorer: players.reduce((max, p) => 
          p.runsScored > (max.runs || 0) ? { name: p.name, runs: p.runsScored } : max, 
          { name: '', runs: 0 }
        ),
        highestWicketTaker: players.reduce((max, p) => 
          p.wicketsTaken > (max.wickets || 0) ? { name: p.name, wickets: p.wicketsTaken } : max,
          { name: '', wickets: 0 }
        ),
        topScorers: [...players]
          .sort((a, b) => b.runsScored - a.runsScored)
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            university: p.university,
            runs: p.runsScored,
            average: p.inningsPlayed > 0 
              ? (p.runsScored / p.inningsPlayed).toFixed(2) 
              : 'N/A'
          })),
        topWicketTakers: [...players]
          .sort((a, b) => b.wicketsTaken - a.wicketsTaken)
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            university: p.university,
            wickets: p.wicketsTaken,
            average: p.wicketsTaken > 0 
              ? (p.runsConceded / p.wicketsTaken).toFixed(2) 
              : 'N/A'
          }))
      };
      
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching tournament summary:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Tournament Summary
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Batting Statistics
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Runs Scored
                </Typography>
                <Typography variant="h4">
                  {summary.totalRuns}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Highest Run Scorer
                </Typography>
                <Typography variant="h5">
                  {summary.highestScorer.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {summary.highestScorer.runs} runs
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Top 5 Run Scorers */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Top 5 Run Scorers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>University</TableCell>
                      <TableCell align="right">Runs</TableCell>
                      <TableCell align="right">Average</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.topScorers.map((player, index) => (
                      <TableRow key={index}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.university}</TableCell>
                        <TableCell align="right">{player.runs}</TableCell>
                        <TableCell align="right">{player.average}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Bowling Statistics
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Wickets Taken
                </Typography>
                <Typography variant="h4">
                  {summary.totalWickets}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Highest Wicket Taker
                </Typography>
                <Typography variant="h5">
                  {summary.highestWicketTaker.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {summary.highestWicketTaker.wickets} wickets
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Top 5 Wicket Takers */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Top 5 Wicket Takers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>University</TableCell>
                      <TableCell align="right">Wickets</TableCell>
                      <TableCell align="right">Average</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.topWicketTakers.map((player, index) => (
                      <TableRow key={index}>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.university}</TableCell>
                        <TableCell align="right">{player.wickets}</TableCell>
                        <TableCell align="right">{player.average}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TournamentSummary;
