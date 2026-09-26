import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app: Express = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow cross-origin only in development (when frontend is on a different port).
// In production the frontend is served from the same Express server so CORS
// isn't needed, but we still add it for flexibility.
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── API ROUTES ─────────────────────────────────────────────────────────────────
// All REST endpoints are mounted under /api
app.use('/api', apiRouter);

// ── SERVE REACT FRONTEND ──────────────────────────────────────────────────────
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];
const frontendDistPath = possibleDistPaths.find((p) => fs.existsSync(p)) || possibleDistPaths[0];

if (fs.existsSync(frontendDistPath)) {
  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(frontendDistPath));

  // Catch-all: any route that is NOT an /api call should return index.html
  // This enables React Router client-side navigation to work correctly.
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      // Should never reach here, but guard just in case
      res.status(404).json({ success: false, message: 'API route not found' });
      return;
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });

  console.log(`[INFO] Serving frontend from: ${frontendDistPath}`);
} else {
  console.warn(
    `[WARN] Frontend build not found at ${frontendDistPath}.\n` +
      `       Run 'npm run build' inside the frontend/ folder first.`
  );

  // Friendly fallback for /
  app.get('/', (_req: Request, res: Response) => {
    res.send(
      '<h2>Campus Issue Tracker API is running.</h2>' +
        '<p>Frontend not built yet. Run <code>npm run build</code> inside <code>frontend/</code>.</p>' +
        '<p>API health: <a href="/api/health">/api/health</a></p>'
    );
  });
}

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
