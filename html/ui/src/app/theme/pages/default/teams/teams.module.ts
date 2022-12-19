import { NgModule } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { DefaultComponent } from '../default.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": TeamsComponent
            }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        LayoutModule,
        FormsModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        TeamsComponent
    ]
})
export class TeamsModule {
}