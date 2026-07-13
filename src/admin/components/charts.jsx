import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const LineChartComponent = ({ data, title, dataKey, xAxisKey }) => (
  <Paper sx={{ p: 2, height: 400 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  </Paper>
);

export const BarChartComponent = ({ data, title, dataKey, xAxisKey }) => (
  <Paper sx={{ p: 2, height: 400 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  </Paper>
);

export const PieChartComponent = ({ data, title }) => (
  <Paper sx={{ p: 2, height: 400 }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height="90%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={entry => entry.name}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
);