import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home-page' },
            { path: 'home-page', loadChildren: () => import('./home-page/home-page.module').then(m => m.HomePageModule) },
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'brain-viewer/:fileId', loadChildren: () => import('./brain-viewer/brain-viewer.module').then(m => m.BrainViewerModule) },
            { path: 'report/:fileId', loadChildren: () => import('./report/report.module').then(m => m.ReportModule) },

            // { path: 'rotate-3d/:fileId', loadChildren: () => import('./rotate-3d/rotate-3d.module').then(m => m.Rotate3DModule) },
            { path: 'analysis-detail/:fileId', loadChildren: () => import('./analysis-detail/analysis-detail.module').then(m => m.AnalysisDetailModule) },
            
            { path: 'datafile-detail/:fileId', loadChildren: () => import('./datafile-detail/datafile-detail.module').then(m => m.DatafileDetailModule) },
            { path: 'list-datafiles', loadChildren: () => import('./list-datafiles/list-datafiles.module').then(m => m.ListDatafilesModule) },
            { path: 'user-profile/:username', loadChildren: () => import('./user-profile/user-profile.module').then(m => m.UserProfileModule) },
            { path: 'monitor-jobs', loadChildren: () => import('./monitor-jobs/monitor-jobs.module').then(m => m.MonitorJobsModule) },
            { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule) },
            { path: 'list-datafiles', loadChildren: () => import('./list-datafiles/list-datafiles.module').then(m => m.ListDatafilesModule) },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
