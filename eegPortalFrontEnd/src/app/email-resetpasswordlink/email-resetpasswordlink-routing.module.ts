import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailResetPasswordLinkComponent } from './email-resetpasswordlink.component';

const routes: Routes = [
    {
        path: '', component: EmailResetPasswordLinkComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmailResetPasswordLinkRoutingModule {
}
