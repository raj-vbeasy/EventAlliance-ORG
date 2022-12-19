import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDetailsPagesHeaderComponent } from "./event-details-pages-header.component";
import { PrivateSurveyModule } from "../private-survey-component/private-survey.module";

@NgModule({
    imports: [
        PrivateSurveyModule,
        CommonModule,
        RouterModule
    ],
    declarations: [
        EventDetailsPagesHeaderComponent
    ], 
    exports: [
        EventDetailsPagesHeaderComponent
    ]
})
export class EventDetailsPagesHeaderModule { }