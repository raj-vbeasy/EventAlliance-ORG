import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Helpers } from '../../../../helpers';
import { EventService } from '../events/events.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Event } from '../events/event';
import { environment } from "../../../../../environments/environment";
import { ScriptLoaderService } from "../../../../_services/script-loader.service";

import { WSResponse } from "../../../../ws-response";
import { EventSurveyService } from "./eventsurvey.service";
import { eventSurvey } from "./eventsurvey";

import { ArtistVoting } from '../../../../_services/artist-voting.service';

import { ClipboardService } from "../../../../_services/clip-board.service";
import { Title } from "@angular/platform-browser";

import * as $ from "jquery";


declare var jQuery: any;
declare var Chart: any;

@Component({
    selector: "app-event-public-survey",
    templateUrl: "./event-public-survey.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [EventService, EventSurveyService, ClipboardService]
})

export class EventPublicSurveyComponent implements OnInit, AfterViewInit {

    public eventDetails: any;
    public eventId: number;
    public environment: any;
    public surveyFormData: eventSurvey;
    public surveyDataDownloadUrl: any = "#";
    public publicSurveyCount: any;
    public optInsCount: any;
    public surveyStep: number = 1;
    public isLastStep: number = 0;
    public isFirstStep: number = 1;
    public title: string = "";
    public conversion_rate: number;
    public questionAnswersCartData: Array<any> = [];
    public chartType: string = "doughnut";
    public chartOptions: any = { "legend": { "position": "right" } };

    public isInArtistSection: boolean = false;

    constructor(private _clipboardService: ClipboardService, private _eventService: EventService, private _eventSurveyService: EventSurveyService, private _activatedRoute: ActivatedRoute, private _script: ScriptLoaderService, public domSanitizer: DomSanitizer, private _artistVoting: ArtistVoting, private _titleService: Title) {
        this.eventDetails = new Event();
        this.environment = environment;
        this.surveyFormData = new eventSurvey();

    }

    ngOnInit() {
        this._titleService.setTitle('Event Public Survey - Event Alliance');

    }

    public copySurveyUrl(){
        this._clipboardService.copy(environment.websiteUrl + "survey/" + this.eventId).then(()=>{
            alert("Survey link has been copied to clipboard");
        }, ()=>{
            alert("Error\n\nThere was an error copyig the link to the clipboard");
        });
    }
	
	public ReloadData(){
		this.LoadData();
	}
	
    ngAfterViewInit() {
        this._script.loadScripts('app-event-public-survey', ['assets/app/js/Chart.bundle.min.js']);

        this._activatedRoute.params.subscribe((params: Params) => {
            this.eventId = params['id'];
            this.publicSurveyGraph(this.eventId);
            this.surveyDataDownloadUrl = this.domSanitizer.bypassSecurityTrustResourceUrl("../api/downloadEventSurveys/index/" + this.eventId);
            Helpers.setLoading(true);
            this._eventService.getEventDetails(this.eventId).subscribe((data: any) => {
                Helpers.setLoading(false);
                this.eventDetails = data.event;
            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Error handling
            });
			
			this.LoadData();
           
        });        
    }

	LoadData(){
		 Helpers.setLoading(true);
		 this._eventService.getEventPublicSurveyOptIns(this.eventId).subscribe((data: any) => {
                Helpers.setLoading(false);
                this.publicSurveyCount = data.response.public_survey_count;
                this.optInsCount = data.response.opt_ins_count;
                this.conversion_rate = ((100 * this.optInsCount) / this.publicSurveyCount);

            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Error handling
            });
	}

    public surveyModal() {
        this.surveyStep = 1;
        this.isFirstStep = 1;
        this.isLastStep = 0;
        jQuery("#eventReview").modal("show");
    }

	public privateSurveyModal(){
		jQuery("#privateSurvey").modal("show");
	}
	
    public titleChange(title) {
        console.log(title);
        this.title = title;
    }

    public toggleVotingButtons(isVisible) {
        console.log(isVisible);
        this.isInArtistSection = isVisible;
    }

    public changeStep(step) {
        this.surveyStep = step;
        if (step > 1) {
            this.isFirstStep = 0;
        }
    }

    public vote(vote: number) {
        this._artistVoting.vote(vote);
    }


    public publicSurveyGraph(eventId: number) {

        this._eventService.getEventPublicSurveyQuestionAnswer(this.eventId).subscribe((data: any) => {
            Helpers.setLoading(false);
            console.log(data);

            for (var _key in data.response.data) {
                this.questionAnswersCartData.push({
                    "title": _key,
                    "labels": Object.keys(data.response.data[_key]),
                    "values": Object.values(data.response.data[_key])
                });
            }

        }, (err) => {
            Helpers.setLoading(false);
        });
    }

    public saveSurvey(eventId: number): void {
        this.surveyFormData.event_id = eventId;

        this._eventSurveyService.getIpAddress().subscribe(data => {
            this.surveyFormData.ip = data;
        });

        //console.log(this.surveyFormData);
        Helpers.setLoading(true);
        this._eventSurveyService.createSurvey(this.surveyFormData).subscribe((response: WSResponse) => {
            Helpers.setLoading(false);
            if (response.status === true) {
                //TODO: show success alert
                //jQuery("#thankYou").modal("hide");

            } else {
                //TODO: Show failure alert
            }
        }, (err) => {

        });
    }
}