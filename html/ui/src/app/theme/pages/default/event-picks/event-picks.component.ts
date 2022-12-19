import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { EventService } from '../events/events.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Event } from '../events/event';
import { WSResponse } from "../../../../ws-response";
import { environment } from "../../../../../environments/environment";
import { Title } from "@angular/platform-browser";

declare var jQuery: any;

@Component({
    selector: "app-event-picks",
    templateUrl: "./event-picks.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [EventService]
})
export class EventPicksComponent implements OnInit, AfterViewInit {

    public eventDetails: any;
    public eventId: number;
    public environment: any;

    public eventSurvey: any;
    public eventArtistSurvey: any;
    public eventArtistSurveyProp: Array<any>;
    public eventSurveyMembers: any;

    public selectedArtistId: number = 0;
    public artistStatus: number = -1;

    public currentUser: any = {};
    public userType:number;

    constructor(private _eventService: EventService, private _activatedRoute: ActivatedRoute, private _titleService: Title) {
        this.eventDetails = new Event();
        this.environment = environment;
    }

    ngOnInit() {
        this._titleService.setTitle('Event Picks - Event Alliance');
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
            this.artistPickedResult();

            //Initialize the bootstrap modals;
            jQuery("#artistStatus").modal({ show: false }).on("hidden.bs.modal", (e) => {
                this.selectedArtistId = 0;
                this.artistStatus = -1;
            });

        });
    }

	public ReloadData(){
		this.artistPickedResult();
	}
	
    public artistPickedResult() {
        Helpers.setLoading(true);
        this._eventService.getEventPickedArtists(this.eventId).subscribe((data: any) => {
            this.eventSurvey = data.response;
            this.eventSurveyMembers = this.eventSurvey.members

            this.eventArtistSurveyProp = Object.keys(this.eventSurvey.data);
            this.eventArtistSurvey = this.eventSurvey.data;

            console.log(this.eventArtistSurvey);

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
            status: 0,
        };
        this._eventService.updatePickStatus(pickData).subscribe((response: WSResponse) => {
            Helpers.setLoading(false);
            if (response.status === true) {
                this.artistPickedResult();
            }

        }, (err) => {
            console.error(err);
            Helpers.setLoading(false);
            //TODO: Error handling
        });
        //alert('Picks');
    }

    public openStatusModal(key: string):void{
        
        this.selectedArtistId = this.eventArtistSurvey[key].artistId;
        this.artistStatus = this.eventArtistSurvey[key].quoteStatus;
        if(this.userType==0) {
            jQuery("#artistStatus").modal("show");
        }
    }

    public UpdatArtistStatus():void{
        this._eventService.changeArtistStatus(this.eventId, this.selectedArtistId, this.artistStatus).subscribe((response:WSResponse) => {
            if(response.status === true){
                jQuery("#artistStatus").modal("hide");
                alert("Artist's status has been updated successfully");
                // event Survey option
                this.artistPickedResult();
            } else {
                alert("Error\n\n" + response.message);
            }
        }, (err) => {
            alert("There was an error communicating with the server");
        });
    }

}