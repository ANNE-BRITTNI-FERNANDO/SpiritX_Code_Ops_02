import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Snackbar,
  Alert,
  TextField,
  Grid
} from '@mui/material';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    autoRefresh: localStorage.getItem('autoRefresh') === 'true',
    refreshInterval: localStorage.getItem('refreshInterval') || '5',
    showBattingStats: localStorage.getItem('showBattingStats') !== 'false',
    showBowlingStats: localStorage.getItem('showBowlingStats') !== 'false'
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (name, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [name]: value };
      localStorage.setItem(name, value);
      return newSettings;
    });

    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      darkMode: false,
      autoRefresh: true,
      refreshInterval: '5',
      showBattingStats: true,
      showBowlingStats: true
    };

    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    setSettings(defaultSettings);
    setSnackbar({
      open: true,
      message: 'Settings reset to default',
      severity: 'info'
    });
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Display Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                />
              }
              label="Dark Mode"
            />
          </FormGroup>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Data Refresh Settings
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                  />
                }
                label="Auto Refresh"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Refresh Interval (minutes)"
                value={settings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', e.target.value)}
                disabled={!settings.autoRefresh}
                inputProps={{ min: 1, max: 60 }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Statistics Display
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showBattingStats}
                  onChange={(e) => handleChange('showBattingStats', e.target.checked)}
                />
              }
              label="Show Batting Statistics"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showBowlingStats}
                  onChange={(e) => handleChange('showBowlingStats', e.target.checked)}
                />
              }
              label="Show Bowling Statistics"
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetSettings}
          sx={{ mr: 2 }}
        >
          Reset to Default
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default SettingsView;
