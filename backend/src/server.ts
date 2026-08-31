import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Authentication & Job Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

app.listen(PORT, () => {
  console.log(`[Backend] Server listening on http://localhost:${PORT}`);
});
