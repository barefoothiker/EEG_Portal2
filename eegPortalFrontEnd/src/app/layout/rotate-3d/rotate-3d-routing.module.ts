import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Rotate3DComponent } from './rotate-3d.component';

const routes: Routes = [
    {
        path: '',
        component: Rotate3DComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class Rotate3DRoutingModule {}
