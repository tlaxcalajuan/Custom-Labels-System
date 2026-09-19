import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response } from 'express';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Directorio donde se persisten las etiquetas guardadas.
 * Cada etiqueta se almacena como `<id>.json` para poder respaldar/versionar
 * fácilmente. Se puede sobrescribir con la variable de entorno
 * `LABELS_DATA_DIR`; por defecto se usa `<cwd>/data/labels`.
 */
const labelsDir = process.env['LABELS_DATA_DIR'] || join(process.cwd(), 'data', 'labels');

/** Solo permite ids "seguros" para nombres de archivo. */
function sanitizeId(id: unknown): string | null {
  if (typeof id !== 'string') return null;
  const cleaned = id.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 128);
  return cleaned || null;
}

/** Garantiza la existencia del directorio de datos antes de leer/escribir. */
async function ensureDataDir(): Promise<void> {
  await fs.mkdir(labelsDir, { recursive: true });
}

const app = express();
const angularApp = new AngularNodeAppEngine();

/** Body parser para JSON (5 MB es más que suficiente para etiquetas con logos data URL). */
app.use(express.json({ limit: '5mb' }));

/**
 * Endpoints REST del catálogo de etiquetas.
 * El shape del cuerpo coincide con `SavedLabel` del cliente.
 */

/** Lista todas las etiquetas persistidas en disco. */
app.get('/api/labels', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(labelsDir);
    const entries: unknown[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(join(labelsDir, file), 'utf8');
        entries.push(JSON.parse(raw));
      } catch {
        // Archivo corrupto: se ignora en la respuesta para no romper el catálogo.
      }
    }
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

/** Devuelve una etiqueta puntual. 404 si no existe. */
app.get('/api/labels/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeId(req.params['id']);
    if (!id) {
      res.status(400).json({ error: 'Id inválido' });
      return;
    }
    const raw = await fs.readFile(join(labelsDir, `${id}.json`), 'utf8');
    res.json(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.sendStatus(404);
      return;
    }
    next(error);
  }
});

/** Crea o reemplaza una etiqueta (idempotente por id). */
app.put('/api/labels/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeId(req.params['id']);
    if (!id) {
      res.status(400).json({ error: 'Id inválido' });
      return;
    }
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Cuerpo JSON requerido' });
      return;
    }
    await ensureDataDir();
    const entry = { ...body, id };
    await fs.writeFile(
      join(labelsDir, `${id}.json`),
      `${JSON.stringify(entry, null, 2)}\n`,
      'utf8',
    );
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

/** Elimina una etiqueta. 204 si tuvo éxito (o no existía). */
app.delete('/api/labels/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeId(req.params['id']);
    if (!id) {
      res.status(400).json({ error: 'Id inválido' });
      return;
    }
    await fs.unlink(join(labelsDir, `${id}.json`)).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`Etiquetas persistidas en: ${labelsDir}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
