import { Component, SimpleChanges, Input, Output, ViewEncapsulation, OnChanges, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { EventService } from '../events/events.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { WSResponse } from "../../../../ws-response";

import { ArtistDetails } from '../artist-details/artistdetails.service';
import { YouTubeVideo } from "../artist-details/youtubevideo";

import { Helpers } from '../../../../helpers';

import { ArtistVoting, Vote } from '../../../../_services/artist-voting.service';

import { environment } from "../../../../../environments/environment";

@Component({
    selector: "private-survey-component",
    templateUrl: "./private-survey.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ArtistDetails]
})

export class PrivateSurveyComponent implements OnChanges {
    public eventDetails: any = {};

    private _oldEventId: number;
    private _oldStep: number = -1;
	private _artistId:number=0;
	private _userId:number=0;
	
	
    public totalStepCount: number = 0;
	public videoStep=0;
	public videoCount=0;

    public environment: any = environment;

    public surveyArtistVideos: Array<YouTubeVideo>;
	public artistVotes :any;
	public memberVotesByArtistID:Array<ArtistVote>=[];
	
    public videoUrl: any = null;
    public video: { title: string, description: string } = { title: "", description: "" };
	public artistTitle:string='';
	public activeArtistId:number=0;

    public surveyInput: SurveyInput = new SurveyInput();
	public artistVote : ArtistVote =new ArtistVote();

    public title: string;
    
    @Input() eventId: number;
    @Input() step:number=0;

    @Output() onStepChange:EventEmitter<number> = new EventEmitter<number>();

    constructor(private cd: ChangeDetectorRef, private _eventService: EventService, public _artistDetails: ArtistDetails, public domSanitizer: DomSanitizer, private artistVoting: ArtistVoting, private _httpClient: HttpClient) {
		let currentUser  = JSON.parse(localStorage.getItem('currentUser'));
		console.log(currentUser);
		this._userId=currentUser.id;
    }

	private nextStep(){
		if(this.step < this.totalStepCount-1)
		{
			
			this.step++;
			this.loadArtistVideos();
			this.videoStep=0;
			this.onStepChange.emit(this.step);
		}
		else{
			console.log('hi');
			this.step++;
			this.artistTitle='Thank you';
			this.onStepChange.emit(this.step);
			//TODO: need to close the modal
		}
	}
	private prevStep(){
		if(this.step > 0)
		{
			
			this.step--;
			this.loadArtistVideos();
			this.videoStep=0;
			this.onStepChange.emit(this.step);
		}
		else{
			//TODO: need to close the modal
		}
	}
	private nextVideo(event){
		
		if(this.videoStep < this.videoCount-1){
			
			this.videoStep++;
			this.cd.markForCheck();
			this.openVideoUrl(this.videoStep)
			event.stopPropagation();
			
		}else{
			event.stopPropagation();
		}
	}
	private prevVideo(event){
		if(this.videoStep > 0){
			
			this.videoStep--;
			this.cd.markForCheck();
			this.openVideoUrl(this.videoStep)
			event.stopPropagation();
			
		}else{
			event.stopPropagation();
		}
	}
	
    public vote(value) {
		console.log(value);
		//TODO: call the API to save the Vote
		this.voteArtist(value);
		
    }

    ngOnChanges(changes: SimpleChanges) {

    	console.log(changes);

    	if(changes.hasOwnProperty("step")){
    		if(changes.step.currentValue != changes.step.previousValue){
    			this.loadArtistVideos();
				this.videoStep=0;
    		}
    	}
		
        if (this._oldEventId != this.eventId) {
            this._oldEventId = this.eventId;
			this.surveyInput.event_id=this.eventId;
            this._getEventSurvey();
        }
    }

    openVideoUrl(index: number) {
		console.log(index);
        this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.surveyArtistVideos[index].videoId);
        this.video.title = this.surveyArtistVideos[index].videoTitle;
        this.video.description = this.surveyArtistVideos[index].videoDescription;
        var aTag = jQuery("#youtubeVideoContainer");
        jQuery('html,body').animate({ scrollTop: aTag.offset().top - 100 }, 'fast');
    }


    private _getEventSurvey() {
        if (this.eventId) {
            console.log("About to call API. Event ID =>" + this.eventId);

            // Get Event details
            this._eventService.getEventDetails(this.eventId).subscribe((data: any) => {
                
                this.eventDetails = data.event;
				console.log(this.eventDetails);
                this.totalStepCount += data.event.event_artists.length;
				this.title=data.event.name;
				
				this._eventService.getArtistVotes(this.eventId).subscribe((data:any)=>{
					Helpers.setLoading(false);
					this.artistVotes=data.response.data;
					
					console.log(this.artistVotes);
				},(err) => {
                //TODO: Error handling
                Helpers.setLoading(false);
				});
				
				this.loadArtistVideos();
            }, (err) => {
                //TODO: Error handling
                Helpers.setLoading(false);
            });
        }
    }
	
	loadArtistVideos(){
		if((this.eventDetails.hasOwnProperty("event_artists")) &&  this.eventDetails.event_artists.length>this.step){
			let artistId = this.eventDetails.event_artists[this.step].artist_id;
			this._artistId=artistId;
	        this.artistTitle = (this.step+1)+"/"+this.eventDetails.event_artists.length+" - "+ this.eventDetails.event_artists[this.step].artist.name;
			
	        //console.log(artistId);
	        this.surveyArtistVideos = [];
	        this.videoUrl = null;
	        this.video.title = "";
	        this.video.description = "";

	        Helpers.setLoading(true);
	        this._artistDetails.getYouTubeArtistByChannel(artistId).subscribe((data: Array<YouTubeVideo>) => {
				Helpers.setLoading(false);
	            this.surveyArtistVideos = data;
				
	            this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + data[0].videoId);
	            this.video.title = this.surveyArtistVideos[0].videoTitle;
	            this.video.description = this.surveyArtistVideos[0].videoDescription;
				this.videoCount=this.surveyArtistVideos.length;
				
				//Load the team member's vote to the particular artist
				for (var key in this.artistVotes) {
					this.memberVotesByArtistID=[];
					console.log('Test');
					console.log(this.artistVotes);
					if(key==artistId){
						this.memberVotesByArtistID=this.artistVotes[key];
						break;
					}
				}
						
	            this.cd.markForCheck();
	        }, (err) => {
	            console.log(err);
	            // TODO : Error Handling
	            Helpers.setLoading(false);
	        });
			this.cd.markForCheck();
		}
	}
	
	
	loadArtistVotes(){
		
	}
	
	
	voteArtist(vote) {
		Helpers.setLoading(true);
		this._eventService.privateVote(this.eventId,this._userId,vote,this._artistId).subscribe((data: any) => {
			console.log(data);
			if(data.status===true){
				alert('vote is submitted successfully');
				this._eventService.getArtistVotes(this.eventId).subscribe((data:any)=>{
					Helpers.setLoading(false);
					this.artistVotes=data.response.data;
					console.log(this.artistVotes);
					this.cd.markForCheck();
				},(err) => {
				//TODO: Error handling
				Helpers.setLoading(false);
				});
			}
			
		}, (err) => {
			//TODO: Error handling
			Helpers.setLoading(false);
		});
		this.nextStep();
    }
}


class SurveyInput {
    public artistId: number;
    public event_id: number;
	public vote:number;


    constructor() {
        this.artistId = 0;
        this.event_id = 0;
		this.vote=0;
    }
}

class ArtistVote{
	public member_id:number;
	public profile_img:string;
	public vote:any;
	
	constructor() {
        this.member_id = 0;
        this.profile_img = null;
		this.vote=null;
    }
}
