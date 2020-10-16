import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommentModalComponent } from './comment-modal.component';

const routes: Routes = [
    {
        path: '', component: CommentModalComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommentModalRoutingModule {
}
