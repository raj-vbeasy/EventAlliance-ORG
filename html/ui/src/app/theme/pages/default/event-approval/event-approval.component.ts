import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { EventService } from '../events/events.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Event } from '../events/event';
import { WSResponse } from "../../../../ws-response";
import { environment } from "../../../../../environments/environment";
import {Title} from "@angular/platform-browser";

declare var jQuery: any;

@Component({
    selector: "app-event-approval",
    templateUrl: "./event-approval.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [EventService]
})

export class EventApprovalComponent implements OnInit, AfterViewInit {

    public eventDetails: any;
    public eventId: number;
    public environment: any;
    public eventSurvey: any;
    public eventArtistSurvey: any;
    public eventArtistSurveyProp: Array<any>;
    public eventSurveyMembers: any;

    public photoUrl: string = environment.graphicsBaseUrl;
    public currentUser: any = {};
    public userType:number;

    constructor(private _eventService: EventService, private _activatedRoute: ActivatedRoute, private _titleService: Title) {
        this.eventDetails = new Event();
        this.environment = environment;
    }

    ngOnInit() {
        this._titleService.setTitle('Event Approval - Event Alliance');
        this.currentUser  = JSON.parse(localStorage.getItem('currentUser'));        
        this.userType = this.currentUser.user_type;

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
            this.eventServeyResults();

        });
    }

	public ReloadData(){
		 this.eventServeyResults();
	}

    public eventServeyResults() {
        Helpers.setLoading(true);
        this._eventService.getEventServeyResults(this.eventId).subscribe((data: any) => {
            this.eventSurvey = data.response;
            this.eventSurveyMembers = this.eventSurvey.members

            this.eventArtistSurveyProp = Object.keys(this.eventSurvey.data);
            this.eventArtistSurvey = this.eventSurvey.data;
            //console.log(this.eventArtistSurveyProp);                
            Helpers.setLoading(false);
        }, (err) => {
			Helpers.setLoading(false);
        });
    }
	

    public savePick(artist_Id: number): void {

        let pickData = {
            artistId: artist_Id,
            eventId: this.eventId,
            status: 1, // 1 is picks
        };
        this._eventService.updatePickStatus(pickData).subscribe((response: WSResponse) => {
            Helpers.setLoading(false);
            if (response.status === true) {
                // event Survey option
                this.eventServeyResults();
            }

        }, (err) => {
            console.error(err);
            Helpers.setLoading(false);
            //TODO: Error handling
        });
        //alert('Picks');
    }

}