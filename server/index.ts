import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import {
  checkSupabaseHealth,
  isSupabaseConfigured,
} from './config/supabaseClient.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging & storage diagnostic header
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  res.setHeader(
    'X-LostFind-Storage',
    isSupabaseConfigured ? 'supabase' : 'memory-fallback'
  );
  next();
});

const healthHandler = async (_req: Request, res: Response) => {
  const dbHealth = await checkSupabaseHealth();
  res.status(dbHealth.configured && !dbHealth.connected ? 503 : 200).json({
    status: 'online',
    app: 'LostFind Campus API Web Service',
    author: 'Andri Pratama (21120124140134)',
    version: '1.0.0',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    database: dbHealth,
    endpoints: {
      health: '/api/health',
      items: '/api/items',
      categories: '/api/categories',
      claims: '/api/claims',
      stats: '/api/items/stats',
    },
  });
};

const apiRouter = express.Router();
apiRouter.get('/', healthHandler);
apiRouter.get('/health', healthHandler);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/items', itemRoutes);
apiRouter.use('/claims', claimRoutes);

// Mount on both /api and / so Vercel rewrites never drop routes regardless of prefix handling
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

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
