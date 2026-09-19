import { Routes } from '@angular/router';

export const labelsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./label-editor/label-editor.component').then((m) => m.LabelEditorComponent),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./label-catalog/label-catalog.component').then((m) => m.LabelCatalogComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./label-editor/label-editor.component').then((m) => m.LabelEditorComponent),
  },
];
