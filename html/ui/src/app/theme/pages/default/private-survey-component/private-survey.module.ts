import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivateSurveyComponent } from "./private-survey.component";

@NgModule({
	imports: [
		CommonModule
	],
    declarations: [
        PrivateSurveyComponent
    ],
    exports: [
    	PrivateSurveyComponent
    ]
})
export class PrivateSurveyModule { }