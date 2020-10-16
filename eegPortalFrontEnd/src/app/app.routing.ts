import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';

const routes: Routes = [

    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
      canActivate: [AuthGuard]
    },

    {
      path: 'dashboard',
      redirectTo: 'dashboard',
      pathMatch: 'full',
      canActivate: [AuthGuard]
    },

    { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard]},
    // { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule)},

    // { path: 'dashboard', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) },
    { path: 'dashboard', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard] },

    { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
    { path: 'logout', loadChildren: () => import('./logout/logout.module').then(m => m.LogoutModule) },
    { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule) },
    { path: 'reset-password/:username', loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule) },
    { path: 'email-resetpasswordlink', loadChildren: () => import('./email-resetpasswordlink/email-resetpasswordlink.module').then(m => m.EmailResetPasswordLinkModule) },
    // { path: 'error', loadChildren: () => import('./server-error/server-error.module').then(m => m.ServerErrorModule) },
    // { path: 'access-denied', loadChildren: () => import('./access-denied/access-denied.module').then(m => m.AccessDeniedModule) },
    // { path: 'not-found', loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) },
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

// import { NgModule } from '@angular/core';
// import { CommonModule, } from '@angular/common';
// import { BrowserModule  } from '@angular/platform-browser';
// import { Routes, RouterModule } from '@angular/router';
// import { AuthGuard } from './shared';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//
// import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
// import { ListDatafilesComponent } from './layout/list-datafiles/list-datafiles.component';
//
// import { LoginComponent } from './login/login.component';
// import { LogoutComponent } from './logout/logout.component';
//
// const routes: Routes =[
//   {
//     path: '',
//     redirectTo: 'dashboard',
//     pathMatch: 'full',
//     // canActivate: [AuthGuard]
//   },
//   {
//     path: 'dashboard',
//     component: AdminLayoutComponent,
//     children: [{
//       path: 'dashboard',
//       loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
//     }],
//     // canActivate: [AuthGuard]
//   },
//   {
//     path: 'list-datafiles',
//     component: ListDatafilesComponent,
//     children: [{
//       path: 'list-datafiles',
//       loadChildren: './layouts/list-datafiles/list-datafiles.module#ListDatafilesModule'
//     }],
//     // canActivate: [AuthGuard]
//   },
//
//   {
//     path: 'login',
//     component: LoginComponent,
//     children: [{
//       path: 'login',
//       loadChildren: './login/login.module#LoginModule'
//     }]
//   },
//   {
//     path: 'logout',
//     component: LogoutComponent,
//     children: [{
//       path: 'logout',
//       loadChildren: './logout/logout.module#LogoutModule'
//     }]
//   },
//
// ];
//
// @NgModule({
//   imports: [
//     CommonModule,
//     BrowserModule,
//     FormsModule,
//     ReactiveFormsModule,
//     RouterModule.forRoot(routes,{
//        useHash: true
//     })
//   ],
//   exports: [
//   ],
// })
// export class AppRoutingModule { }

// import { NgModule } from '@angular/core';
// import { Routes, RouterModule } from '@angular/router';
// import { AppComponent } from './app.component';
// import { AuthGuard } from './shared';
//
// const routes: Routes = [
//
//     { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard]},
//     { path: 'dashboard', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard] },
//     { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
//     { path: 'logout', loadChildren: () => import('./logout/logout.module').then(m => m.LogoutModule) },
//     { path: 'signup', loadChildren: () => import('./signup/signup.module').then(m => m.SignupModule) },
//     { path: 'reset-password/:username', loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule) },
//     { path: 'email-resetpasswordlink', loadChildren: () => import('./email-resetpasswordlink/email-resetpasswordlink.module').then(m => m.EmailResetPasswordLinkModule) },
//     { path: 'error', loadChildren: () => import('./server-error/server-error.module').then(m => m.ServerErrorModule) },
//     { path: 'access-denied', loadChildren: () => import('./access-denied/access-denied.module').then(m => m.AccessDeniedModule) },
//     { path: 'not-found', loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) },
//     { path: '**', redirectTo: 'not-found' }
// ];
//
// @NgModule({
//     imports: [RouterModule.forRoot(routes)],
//     exports: [RouterModule]
// })
// export class AppRoutingModule {}
