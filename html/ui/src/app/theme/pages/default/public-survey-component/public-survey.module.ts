import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EventService } from '../events/events.service';
import { PublicSurveyComponent } from './public-survey.component'
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
		FormsModule
    ], exports: [
        RouterModule,
        PublicSurveyComponent
    ], declarations: [
        PublicSurveyComponent
    ],
    providers: [EventService]
})

export class PublicSurveyModule {



}