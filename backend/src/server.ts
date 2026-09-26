import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Campus Issue Tracker - Backend API Server     `);
  console.log(` Status: Running at http://localhost:${PORT}   `);
  console.log(` Health Check: http://localhost:${PORT}/api/health `);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`===============================================`);
});

export default server;
