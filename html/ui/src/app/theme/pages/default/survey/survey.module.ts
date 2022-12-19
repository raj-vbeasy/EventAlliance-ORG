import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './survey.component';
import { LayoutModule } from '../../../layouts/layout.module';
import { DefaultComponent } from '../default.component';
import { EventService } from '../events/events.service';
import { PublicSurveyModule } from '../public-survey-component/public-survey.module'

const routes: Routes = [
    {
        "path": "",
        "component": DefaultComponent,
        "children": [
            {
                "path": "",
                "component": SurveyComponent
            }
        ]
    }
];
@NgModule({
    imports: [
        CommonModule, RouterModule.forChild(routes), LayoutModule, PublicSurveyModule
    ], exports: [
        RouterModule
    ], declarations: [
        SurveyComponent
    ],
    providers: [EventService]
})

export class SurveyModule {



}