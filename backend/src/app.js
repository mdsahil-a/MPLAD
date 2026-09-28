import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import mapRoutes from './routes/mapRoutes.js';

const app = express();

// Enable CORS for frontend connection
app.use(cors());
app.use(express.json());

// API Base Routes
app.get('/api', (req, res) => {
  res.json({
    name: 'MPLAD Anomaly Detection System API (SIH26102)',
    status: 'online',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/map', mapRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;
