import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'labels',
    renderMode: RenderMode.Prerender
  },
  {
    // Catálogo: se hidrata en el cliente porque los datos viven en localStorage.
    path: 'labels/catalog',
    renderMode: RenderMode.Client
  },
  {
    // Editor con id dinámico: sin prerender (id no existe en build time).
    path: 'labels/edit/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'pokemons',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'pokemons/:name',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
