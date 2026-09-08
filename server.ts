import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest, ApiRequest } from './functions/api-router';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Universal API route handler forwarding to functions/api-router
  app.all(['/api', '/api/*'], async (req: Request, res: Response) => {
    const query: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === 'string') query[k] = v;
    }

    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') headers[k] = v;
    }

    const apiReq: ApiRequest = {
      method: req.method,
      path: req.path,
      query,
      headers,
      body: req.body
    };

    try {
      const result = await handleApiRequest(apiReq, process.env);
      if (result.headers) {
        for (const [hk, hv] of Object.entries(result.headers)) {
          res.setHeader(hk, hv);
        }
      }
      res.status(result.status).json(result.body);
    } catch (err: any) {
      console.error('API Error:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Vite Middleware for Dev vs Static serving in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 SKxMOVIES server online at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
