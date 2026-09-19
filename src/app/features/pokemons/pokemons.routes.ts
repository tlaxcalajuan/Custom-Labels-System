import { Routes } from '@angular/router';

export const pokemonsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pokemon-list/pokemon-list.component').then((m) => m.PokemonListComponent),
  },
  {
    path: ':name',
    loadComponent: () =>
      import('./pokemon-detail/pokemon-detail.component').then((m) => m.PokemonDetailComponent),
  },
];