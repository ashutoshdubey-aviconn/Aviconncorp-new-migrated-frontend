import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

// Login is the landing page, so it stays in the initial bundle. Every other
// screen is lazy-loaded and only downloaded when the user navigates to it.
const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'superadmin', loadComponent: () => import('./super-admin/super-admin.component').then(m => m.SuperAdminComponent) },
  { path: 'comingsoon', loadComponent: () => import('./coming-dash/coming-dash.component').then(m => m.ComingDashComponent) },
  { path: 'customer', loadComponent: () => import('./customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent) },
  { path: 'warehouse', loadComponent: () => import('./warehouse/warehouse.component').then(m => m.WarehouseComponent) },
  { path: 'whmetering', loadComponent: () => import('./wh-metering/wh-metering.component').then(m => m.WhMeteringComponent) },
  { path: 'baseline', loadComponent: () => import('./baseline/baseline.component').then(m => m.BaselineComponent) },
  { path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
  { path: 'firePumpAlarm', loadComponent: () => import('./fire-pump-alarm/fire-pump-alarm.component').then(m => m.FirePumpAlarmComponent) },
  { path: 'fems', loadComponent: () => import('./fems/fems.component').then(m => m.FemsComponent) },
  { path: 'load_graph', loadComponent: () => import('./load-graph/load-graph.component').then(m => m.LoadGraphComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
