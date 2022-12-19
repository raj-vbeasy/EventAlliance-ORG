import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CurrentEventComponent } from './current-event.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { FormsModule } from '@angular/forms';
import { DefaultComponent } from '../default.component';

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": CurrentEventComponent
            }
        ]
    }
];
@NgModule({
    imports: [
        CommonModule, RouterModule.forChild(routes), LayoutModule, FormsModule
    ], exports: [
        RouterModule
    ], declarations: [
        CurrentEventComponent
    ]
})
export class CurrentEventModule {



}