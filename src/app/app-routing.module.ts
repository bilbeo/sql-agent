import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuardService } from './providers/auth-guard.service';

const routes: Routes = [

    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        // children: [
        //     {
        //       path: 'dashboard',
        //       component: DashboardComponent,
        //     }
        // ]
    },
    {
        path: 'auth',
        component: AuthComponent
    },
    {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full'
    },
    { path: '**', component: AuthComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
