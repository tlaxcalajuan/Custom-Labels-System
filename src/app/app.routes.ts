import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pokemons',
    loadChildren: () =>
      import('./features/pokemons/pokemons.routes').then((m) => m.pokemonsRoutes),
  },
  {
    path: 'labels',
    loadChildren: () => import('./features/labels/labels.routes').then((m) => m.labelsRoutes),
  },
  {
    path: '',
    redirectTo: 'labels',
    pathMatch: 'full',
  },
];
