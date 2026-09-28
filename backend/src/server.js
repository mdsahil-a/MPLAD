import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` MPLAD Anomaly Detection Backend API Server (SIH26102)`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Base Endpoint: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});
