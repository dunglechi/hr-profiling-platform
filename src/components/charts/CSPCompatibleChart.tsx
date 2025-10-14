import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { Box, Typography, useTheme } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

interface CompatibilityData {
  leadership: number;
  teamwork: number;
  communication: number;
  innovation: number;
  analytical: number;
  overall: number;
}

interface CSPChartProps {
  data: CompatibilityData;
  type?: 'radar' | 'doughnut' | 'bar';
  title?: string;
  height?: number;
}

export const CSPCompatibleChart: React.FC<CSPChartProps> = ({ 
  data, 
  type = 'radar', 
  title,
  height = 300 
}) => {
  const theme = useTheme();

  const chartData = {
    labels: ['Lãnh Đạo', 'Teamwork', 'Giao Tiếp', 'Sáng Tạo', 'Phân Tích'],
    datasets: [
      {
        label: 'Khả Năng (%)',
        data: [data.leadership, data.teamwork, data.communication, data.innovation, data.analytical],
        backgroundColor: [
          'rgba(33, 150, 243, 0.2)',
          'rgba(76, 175, 80, 0.2)',
          'rgba(255, 152, 0, 0.2)',
          'rgba(156, 39, 176, 0.2)',
          'rgba(244, 67, 54, 0.2)',
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: theme.palette.text.primary,
        font: {
          family: theme.typography.fontFamily,
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    scales: type === 'radar' ? {
      r: {
        angleLines: {
          color: theme.palette.divider,
        },
        grid: {
          color: theme.palette.divider,
        },
        pointLabels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
          },
        },
        ticks: {
          color: theme.palette.text.secondary,
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    } : type === 'bar' ? {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          color: theme.palette.divider,
        },
      },
    } : {},
  };

  const renderChart = () => {
    switch (type) {
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'radar':
      default:
        return <Radar data={chartData} options={options} />;
    }
  };

  return (
    <Box sx={{ height: height, position: 'relative' }}>
      {title && (
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
      )}
      {renderChart()}
    </Box>
  );
};

// Component wrapper cho compatibility radar chart
export const CompatibilityRadarChart: React.FC<{ data: CompatibilityData }> = ({ data }) => {
  return (
    <CSPCompatibleChart 
      data={data} 
      type="radar" 
      title="Biểu Đồ Tương Thích" 
      height={350}
    />
  );
};

// Component cho overall compatibility display
export const OverallCompatibilityChart: React.FC<{ data: CompatibilityData }> = ({ data }) => {
  return (
    <CSPCompatibleChart 
      data={data} 
      type="doughnut" 
      title="Tương Thích Tổng Thể" 
      height={300}
    />
  );
};

export default CSPCompatibleChart;