import { AdminComponent } from './admin/admin.component';
import { WhMeteringComponent } from './wh-metering/wh-metering.component';
// import { TestComponent } from './test/test.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { ComingDashComponent } from './coming-dash/coming-dash.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { BaselineComponent } from './baseline/baseline.component';
import { FirePumpAlarmComponent} from './fire-pump-alarm/fire-pump-alarm.component';
import { FemsComponent } from './fems/fems.component'



const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: '', component: LoginComponent},
  { path: 'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'superadmin', component: SuperAdminComponent},
  { path: 'comingsoon', component: ComingDashComponent},
  { path: 'customer', component: CustomerDashboardComponent},
  { path: 'warehouse', component: WarehouseComponent},
  { path: 'whmetering', component: WhMeteringComponent },
  { path: 'baseline', component:BaselineComponent},
  { path: 'admin', component:AdminComponent},
  { path: 'firePumpAlarm',component:FirePumpAlarmComponent},
  { path: 'fems',component:FemsComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
