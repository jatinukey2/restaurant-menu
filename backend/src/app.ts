import express, { Application } from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes';
import { errorHandler } from './middleware/error';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;
