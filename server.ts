import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Aumentar limite para payloads grandes se necessário
  app.use(express.json({ limit: '50mb' }));
  app.use(cors());

  // Proxy para a API externa (evita CORS e Mixed Content)
  const EXTERNAL_API_URL = 'http://177.10.91.98:8888';

  app.all('/proxy/*', async (req, res) => {
    const targetUrl = `${EXTERNAL_API_URL}${req.url.replace('/proxy', '')}`;
    console.log(`[Proxy] ${req.method} ${targetUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[Proxy Body]`, JSON.stringify(req.body));
    }
    
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || '',
          'Accept': 'application/json'
        },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        data = { message: await response.text() };
      }
      
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error(`[Proxy Error] ${error.message}`);
      res.status(500).json({ 
        status: false, 
        mensagem: 'Erro na conexão entre o servidor proxy e a API externa.',
        erro: error.message 
      });
    }
  });

  // Integrar Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor Comércio Fácil rodando em http://localhost:${PORT}`);
  });
}

startServer();
