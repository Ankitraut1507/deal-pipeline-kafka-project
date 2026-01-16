import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DealListComponent } from './deals/deal-list/deal-list';
import { DealCreateComponent } from './deals/deal-create/deal-create';
import { DealEditComponent } from './deals/deal-edit/deal-edit';
import { authGuard } from './shared/auth-guard';
import { roleGuard } from './shared/role-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'deals',
    component: DealListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'deals/create',
    component: DealCreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'deals/edit/:id',
    component: DealEditComponent,
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
