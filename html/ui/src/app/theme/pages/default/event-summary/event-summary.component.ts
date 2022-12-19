import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { EventService } from '../events/events.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Event } from '../events/event';
import { environment } from "../../../../../environments/environment";
import { Title } from "@angular/platform-browser";

declare var jQuery: any;

@Component({
    selector: "app-event-summary",
    templateUrl: "./event-summary.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [EventService]
})

export class EventSummaryComponent implements OnInit, AfterViewInit {

    public eventDetails: any;
    public eventId: number;
    public environment: any;
    public eventSurvey: any;
    public eventArtistSurvey: any;
    public eventArtistSurveyProp: Array<any>;
    public eventSurveyMembers: any;
    public progress: any;

    constructor(private _eventService: EventService, private _activatedRoute: ActivatedRoute, private _titleService: Title) {
        this.eventDetails = new Event();
        this.environment = environment;
    }

    ngOnInit() {
        this._titleService.setTitle('Event Summary - Event Alliance');
    }

	public ReloadData(){
		this.LoadData();
	}
	
    ngAfterViewInit() {
        this._activatedRoute.params.subscribe((params: Params) => {

            this.eventId = params['id'];

            Helpers.setLoading(true);
            this._eventService.getEventDetails(this.eventId).subscribe((data: any) => {
                Helpers.setLoading(false);
                this.eventDetails = data.event;
            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Error handling
            });

            // event Survey option
			this.LoadData();

        });
    }
	
	LoadData(){
		 Helpers.setLoading(true);
		 this._eventService.getEventServeyResults(this.eventId).subscribe((data: any) => {
                this.eventSurvey = data.response;
                this.eventSurveyMembers = this.eventSurvey.members

                this.eventArtistSurveyProp = Object.keys(this.eventSurvey.data);
                this.eventArtistSurvey = this.eventSurvey.data;
                //console.log(this.eventArtistSurveyProp);
                this.progress = 3;
				 Helpers.setLoading(false);
            }, (err) => {
				 Helpers.setLoading(false);
            });
	}
}