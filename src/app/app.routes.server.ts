import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'labels',
    renderMode: RenderMode.Prerender
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
