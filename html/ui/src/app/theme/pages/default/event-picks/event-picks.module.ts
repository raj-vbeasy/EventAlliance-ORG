import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventPicksComponent } from './event-picks.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { DefaultComponent } from '../default.component';
import { EventDetailsPagesHeaderModule } from "../event-detail-pages-header/event-details-pages-header.module";
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": EventPicksComponent
            }
        ]
    }
];
@NgModule({
    imports: [
        CommonModule, RouterModule.forChild(routes), LayoutModule, EventDetailsPagesHeaderModule, FormsModule
    ], exports: [
        RouterModule
    ], declarations: [
        EventPicksComponent
    ]
})
export class EventPicksModule {



}