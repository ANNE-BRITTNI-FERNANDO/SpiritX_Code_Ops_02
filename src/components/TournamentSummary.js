import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';

const TournamentSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/players/summary');
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching tournament summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Failed to load tournament summary
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tournament Summary
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Total Runs</Typography>
                  <Typography variant="h6">{summary.totalRuns}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Total Wickets</Typography>
                  <Typography variant="h6">{summary.totalWickets}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography color="textSecondary">Highest Run Scorer</Typography>
                  <Typography variant="h6">
                    {summary.highestRunScorer?.name} ({summary.highestRunScorer?.runsScored} runs)
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="textSecondary">Highest Wicket Taker</Typography>
                  <Typography variant="h6">
                    {summary.highestWicketTaker?.name} ({summary.highestWicketTaker?.wicketsTaken} wickets)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TournamentSummary;