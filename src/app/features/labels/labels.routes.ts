import { Routes } from '@angular/router';

export const labelsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./label-editor/label-editor.component').then((m) => m.LabelEditorComponent),
  },
];
