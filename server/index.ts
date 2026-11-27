import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes';
import itemRoutes from './routes/itemRoutes';
import claimRoutes from './routes/claimRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root API Health Check
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'LostFind Campus API Web Service',
    author: 'Andri Pratama (21120124140134)',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      categories: '/api/categories',
      claims: '/api/claims',
      stats: '/api/items/stats',
    },
  });
});

// Mount Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);

// Start server if not running in Vercel serverless or test environment
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🚀 LostFind API Web Service berjalan pada port: ${port}`);
    console.log(`📍 URL: http://localhost:${port}/api`);
    console.log(`👤 Pengembang: Andri Pratama (21120124140134)`);
    console.log(`====================================================`);
  });
}

export default app;
