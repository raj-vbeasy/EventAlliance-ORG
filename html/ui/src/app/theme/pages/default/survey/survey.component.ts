import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Helpers } from '../../../../helpers';
import { ArtistVoting } from '../../../../_services/artist-voting.service';
import { Title } from "@angular/platform-browser";

@Component({
    selector: "survey",
    templateUrl: "./survey.component.html",
    encapsulation: ViewEncapsulation.None,
})

export class SurveyComponent implements OnInit, AfterViewInit {

    public eventId: number;
    public surveyStep: number = 1;
    public isLastStep: number = 0;
    public isFirstStep: number = 1;
    public title: string = "Welcome";
    public isInArtistSection: boolean = false;
    public isInQuestionsSection: boolean = false;
    public isQuestionAnswered: boolean = false;

    constructor(private _activatedRoute: ActivatedRoute, private _artistVoting: ArtistVoting, private _titleService: Title) {

    }

    public toggleVotingButtons(isVisible) {
        console.log(isVisible);
        this.isInArtistSection = isVisible;
    }

    public toggleQuestionsSection(isVisible) {
        this.isInQuestionsSection = isVisible;
    }

    public changeStep(step) {
        this.surveyStep = step;
        if (step > 1) {
            this.isFirstStep = 0;
        }
    }

    ngOnInit() {
        this._titleService.setTitle('Public Survey - Event Alliance');
    }

    ngAfterViewInit() {
        this._activatedRoute.params.subscribe((params: Params) => {
            setTimeout(() => {
                console.log("changing event id");
                this.eventId = params['id'];
            }, 2000);
        });
    }

    public titleChange(title) {
        this.title = title;
    }

    public vote(vote: number) {
        this._artistVoting.vote(vote);
    }

    public nextStep() {
        if (this.isInQuestionsSection && !this.isQuestionAnswered) {
            alert("Please select one of the options");
            return;
        }
        this.surveyStep = this.surveyStep + 1;
        this.isFirstStep = 0;
    }
}