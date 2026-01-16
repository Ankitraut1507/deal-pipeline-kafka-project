import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list';
import { UserCreateComponent } from './user-create/user-create';
import { roleGuard } from '../shared/role-guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    children: [
      { path: 'users', component: UserListComponent },
      { path: 'users/create', component: UserCreateComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
