import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list/task-list.component').then(
        m => m.TaskListComponent,
      ),
  },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  // Phase 3 will add: { path: 'login', loadComponent: () => import(...) }
  // Phase 3 will add: { path: 'register', loadComponent: () => import(...) }
  // Phase 3 will add: canActivate: [authGuard] on the tasks route
];
