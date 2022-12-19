import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventSummaryComponent } from './event-summary.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { DefaultComponent } from '../default.component';
import { EventDetailsPagesHeaderModule } from "../event-detail-pages-header/event-details-pages-header.module";

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": EventSummaryComponent
            }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes), 
        LayoutModule,
        EventDetailsPagesHeaderModule
    ], exports: [
        RouterModule,
    ], declarations: [
        EventSummaryComponent,
    ]
})

export class EventSummaryModule { }