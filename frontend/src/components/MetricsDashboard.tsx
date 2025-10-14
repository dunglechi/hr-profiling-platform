import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Speed,
  Error,
  TrendingUp,
  AttachMoney,
  People,
  Assessment
} from '@mui/icons-material';
import { systemMonitor, SystemMetrics } from '../lib/systemMonitor';

const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Partial<SystemMetrics> | null>(null);
  const [historicalData, setHistoricalData] = useState<SystemMetrics[]>([]);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production
    setIsProduction(import.meta.env.PROD);

    // Get initial metrics
    setMetrics(systemMonitor.getCurrentMetrics());

    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setMetrics(systemMonitor.getCurrentMetrics());
    }, 30000);

    // Load historical data
    systemMonitor.getHistoricalMetrics(24).then(setHistoricalData);

    return () => clearInterval(interval);
  }, []);

  if (!isProduction) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Alert severity="info">
          <AlertTitle>Development Mode</AlertTitle>
          Metrics dashboard is available in production environment only.
        </Alert>
      </Paper>
    );
  }

  if (!metrics) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          📊 System Metrics Dashboard
        </Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading metrics...
        </Typography>
      </Paper>
    );
  }

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'error';
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Box sx={{ color: `${color}.main`, mr: 1 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={`${color}.main`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        📊 Real-time System Metrics
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Last updated: {new Date(metrics.timestamp || Date.now()).toLocaleTimeString()}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* API Performance */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="API Calls"
            value={metrics.apiCalls?.total || 0}
            icon={<Speed />}
            color="primary"
            subtitle={`Avg response: ${(metrics.apiCalls?.avgResponseTime || 0).toFixed(0)}ms`}
          />
        </Grid>

        {/* Error Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Error Rate"
            value={formatPercent(metrics.apiCalls?.errorRate || 0)}
            icon={<Error />}
            color={metrics.apiCalls?.errorRate && metrics.apiCalls.errorRate > 0.05 ? 'error' : 'success'}
            subtitle="Last 24 hours"
          />
        </Grid>

        {/* AI Costs */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="AI Costs"
            value={formatCurrency(metrics.aiCosts?.estimatedCost || 0)}
            icon={<AttachMoney />}
            color="warning"
            subtitle={`${metrics.aiCosts?.openaiTokens || 0} tokens used`}
          />
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics.userActivity?.activeUsers || 0}
            icon={<People />}
            color="success"
            subtitle={`Peak: ${metrics.userActivity?.peakConcurrentUsers || 0}`}
          />
        </Grid>

        {/* Completed Assessments */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Assessments"
            value={metrics.userActivity?.completedAssessments || 0}
            icon={<Assessment />}
            color="primary"
            subtitle="Completed today"
          />
        </Grid>

        {/* CV Analysis Calls */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="CV Analysis"
            value={metrics.aiCosts?.cvAnalysisCalls || 0}
            icon={<TrendingUp />}
            color="warning"
            subtitle={`Avg ${(metrics.aiCosts?.averageTokensPerCall || 0).toFixed(0)} tokens/call`}
          />
        </Grid>
      </Grid>

      {/* API Endpoints Breakdown */}
      {metrics.apiCalls?.byEndpoint && Object.keys(metrics.apiCalls.byEndpoint).length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            📈 API Endpoints Usage
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(metrics.apiCalls.byEndpoint).map(([endpoint, calls]) => (
              <Grid item xs={12} sm={6} md={4} key={endpoint}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {endpoint}
                  </Typography>
                  <Typography variant="h6">
                    {calls} calls
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(calls / (metrics.apiCalls?.total || 1)) * 100}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Alerts and Warnings */}
      <Box sx={{ mt: 4 }}>
        {metrics.apiCalls?.errorRate && metrics.apiCalls.errorRate > 0.1 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>High Error Rate Detected</AlertTitle>
            Current error rate is {formatPercent(metrics.apiCalls.errorRate)}. 
            Please check system logs and API endpoints.
          </Alert>
        )}

        {metrics.aiCosts?.estimatedCost && metrics.aiCosts.estimatedCost > 10 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>AI Cost Alert</AlertTitle>
            Current AI costs are ${metrics.aiCosts.estimatedCost.toFixed(2)} today. 
            Monitor usage to prevent unexpected charges.
          </Alert>
        )}

        {metrics.userActivity?.peakConcurrentUsers && metrics.userActivity.peakConcurrentUsers > 50 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>High Traffic</AlertTitle>
            Peak concurrent users reached {metrics.userActivity.peakConcurrentUsers}. 
            Monitor performance and consider scaling if needed.
          </Alert>
        )}
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
        ⚡ Powered by real-time monitoring • Updated every 30 seconds
      </Typography>
    </Paper>
  );
};

export default MetricsDashboard;