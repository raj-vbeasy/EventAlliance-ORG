import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventPublicSurveyComponent } from './event-public-survey.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { DefaultComponent } from '../default.component';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { PublicSurveyModule } from '../public-survey-component/public-survey.module';
import { EventDetailsPagesHeaderModule } from "../event-detail-pages-header/event-details-pages-header.module";

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": EventPublicSurveyComponent
            }
        ]
    }
];
@NgModule({
    imports: [
        CommonModule, RouterModule.forChild(routes), FormsModule, LayoutModule, ChartsModule, PublicSurveyModule, EventDetailsPagesHeaderModule
    ], exports: [
        RouterModule
    ], declarations: [
        EventPublicSurveyComponent
    ]
})
export class EventPublicSurveyModule {



}