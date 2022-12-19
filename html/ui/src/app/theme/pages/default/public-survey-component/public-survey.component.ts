import { Component, Input, Output, ViewEncapsulation, AfterViewInit, OnChanges, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
    selector: "public-survey-component",
    templateUrl: "./public-survey.component.html",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ArtistDetails]
})

export class PublicSurveyComponent implements OnChanges, AfterViewInit {
    public eventDetails: any = {};

    private _oldEventId: number;
    private _oldStep: number = 1;
    public totalStepCount: number = 6;
    public surveyQuestionAnswers: Array<any> = [];

    public surveyStatus: number;

    public environment: any = environment;

    public surveyArtistVideos: Array<YouTubeVideo>;
    public videoUrl: any = null;
    public video: { title: string, description: string } = { title: "", description: "" };
	public activeArtistId:number=0;
	public activeQuestionId:number=0;

    public videoStep=0;
    public videoCount=0;

    public surveyInput: SurveyInput = new SurveyInput();


    @Input() step: number;
    @Input() title: string;
    @Input() eventId: number;
	@Input() isPrivate: boolean=true;
    @Output() onStepChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() onTitleChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() onLastStep: EventEmitter<void> = new EventEmitter<void>();
    @Output() onFirstStep: EventEmitter<void> = new EventEmitter<void>();
    @Output() onArtistsSectionToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onQuestionsSectionToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output() onNewQuestion: EventEmitter<void> = new EventEmitter<void>();
    @Output() onQuestionAnswered: EventEmitter<void> = new EventEmitter<void>();

    constructor(private cd: ChangeDetectorRef, private _eventService: EventService, public _artistDetails: ArtistDetails, public domSanitizer: DomSanitizer, private artistVoting: ArtistVoting, private _httpClient: HttpClient) {

    }

    public answerOptionClick(optionId: number) {
		
        console.log("click on option => " + optionId);
		this.surveyInput.addQuestion(this.activeQuestionId,optionId);
        this.onQuestionAnswered.emit();
    }

    ngAfterViewInit() {
        Helpers.setLoading(true);
        this.artistVoting.VotingStream.subscribe((vote: Vote) => {
            console.log("Vote cast => " + vote.vote);
			this.surveyInput.addArtist(this.activeArtistId,vote.vote);
            this._nextStep();
            Helpers.setLoading(false);
        });
    }

    private _nextStep() {        
        this.step++;
		this.videoStep=0;
        this.ngOnChanges();
    }

// -----------------------------
   

    private nextVideo(event){
        
        if(this.videoStep < this.videoCount-1){            
            this.videoStep++;
           // alert(this.videoStep);
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
    //-------------------------------------

    ngOnChanges() {
        if (this._oldEventId != this.eventId) {
            this._oldEventId = this.eventId;
			this.surveyInput.event_id=this.eventId;
            this._getEventSurvey();
        }

        if (this._oldStep != this.step) {
            this._oldStep = this.step;
            Helpers.setLoading(false);

            this.onStepChange.emit(this.step);

            if (this.step == this.totalStepCount) {
                this.onLastStep.emit();
                this.title = "Thank You!";
				Helpers.setLoading(true);
				this.saveSurvey(this.surveyInput).subscribe((response: WSResponse) => {
					console.log(response);
					Helpers.setLoading(false);
					if (response.status === true) {
						//TODO: Notify user for success
                        //alert("Thank you for participating in the survey!");
					}
				}, (err) => {
					console.log(err);
					Helpers.setLoading(false);
				});		
            }
            if (this.step == 1) {
                this.onFirstStep.emit();
                this.title = "Welcome";

            }
            if (this.step == 2) {
                this.title = "About the Event";

            }
            if (this.step == 3) {
                this.title = "Instructions";
            }
			
			// Artist section start
			
            if (this.step >= 4 && this.step < (4 + this.eventDetails.event_artists.length)) {
                this.onArtistsSectionToggle.emit(true);
                let artistId = this.eventDetails.event_artists[this.step - 4].artist_id;
                this.title = this.eventDetails.event_artists[this.step - 4].artist.name;
				
                //console.log(artistId);
                this.surveyArtistVideos = [];
                this.videoUrl = null;
                this.video.title = "";
                this.video.description = "";

                Helpers.setLoading(true);
                this._artistDetails.getYouTubeArtistByChannel(artistId).subscribe((data: Array<YouTubeVideo>) => {                   
                    this.surveyArtistVideos = data;
                    this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + data[0].videoId);
                    this.video.title = this.surveyArtistVideos[0].videoTitle;
                    this.video.description = this.surveyArtistVideos[0].videoDescription;
                    this.videoCount=this.surveyArtistVideos.length;

                    this.cd.markForCheck();
                     Helpers.setLoading(false);
                }, (err) => {
                    console.log(err);
                    // TODO : Error Handling
                    Helpers.setLoading(false);
                });
				
				this.activeArtistId=artistId;
				
            } else {
                this.onArtistsSectionToggle.emit(false);
            }
			
			// Artist section end
			
            
			let firstIndex: number = 4 + this.eventDetails.event_artists.length;

			// Question section start
			
            if (this.step >= (4 + this.eventDetails.event_artists.length) && this.step < (4 + this.eventDetails.event_artists.length + this.surveyQuestionAnswers.length)) {
                this.onQuestionsSectionToggle.emit(true);
				
				let questionId=this.surveyQuestionAnswers[this.step - firstIndex].id;
                this.title = "Closing Questions " + (this.step - firstIndex + 1) + "/" + this.surveyQuestionAnswers.length;
                this.onNewQuestion.emit();
				this.activeQuestionId=questionId;
				
            } else {
                this.onQuestionsSectionToggle.emit(false);
            }
			
			// Question section end
			
			
            if (this.step == (this.totalStepCount - 1) && this.eventDetails.opt_in == 1) {
                this.title = "Opt-In";
            }

            this.onTitleChange.emit(this.title);
            this.cd.markForCheck();
        }
    }

    openVideoUrl(index: number) {      
       
        this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.surveyArtistVideos[index].videoId);
        this.video.title = this.surveyArtistVideos[index].videoTitle;
        this.video.description = this.surveyArtistVideos[index].videoDescription;
        var aTag = jQuery("#youtubeVideoContainer");
        jQuery('html,body').animate({ scrollTop: aTag.offset().top - 100 }, 'fast');
    }

    takeSurvey() {
        this._nextStep();
    }

    private _getEventSurvey() {
        Helpers.setLoading(true);
        console.log(this.eventId);
        if (this.eventId) {
            console.log("About to call API. Event ID =>" + this.eventId);

            // Get Event details
            this._eventService.getEventDetails(this.eventId).subscribe((data: any) => {
                Helpers.setLoading(false);
                this.eventDetails = data.event;
                this.totalStepCount = 3; //First 3 fixed steps
                this.totalStepCount += data.event.event_artists.length;

                if(data.event.public_survey_status == "Open") {
                    this.surveyStatus =1;
                } else {
                    this.surveyStatus =0;
                }
                //console.log(data.event.public_survey_status);

                // Srtart

                // End

                if (data.event.opt_in == 1) this.totalStepCount++;
                this.totalStepCount += 1; //Thank you step
                this._eventService.getEventSurveyQueries(this.eventId).subscribe((data: any) => {
                    Helpers.setLoading(false);
                    for (var _key in data.data) {
                        this.totalStepCount++;
                        this.surveyQuestionAnswers.push({
							"id":data.data[_key].id,
                            "questions": data.data[_key].question,
                            "options": data.data[_key].survey_question_options
                        });
                    }
                    console.log(this.totalStepCount);
                    this.cd.markForCheck();
                }, (err) => {
                    //TODO: Error handling
                    Helpers.setLoading(false);
                });
            }, (err) => {
                //TODO: Error handling
                Helpers.setLoading(false);
            });
        }
    }
	
	 saveSurvey(Data: SurveyInput): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/saveEventSurveys.json", Data);
    }
}


class SurveyInput {
    public artists: Array<{ artist_id: number, vote: number }>;
    public questions: Array<{ question_id: number, option_id: number }>;
    public email: string;
    public name: string;
    public event_id: number;

	public addArtist(artist_id:number, vote:number){
		let isExist:boolean=false;
		for (var key in this.artists) {
			var obj = this.artists[key];
			if(obj.artist_id==artist_id) {
				isExist=true;
				obj.vote=vote;
			}
		}
		if(!isExist){
			this.artists.push({artist_id:artist_id,vote:vote});
		}
		console.log(this.artists);
	}

	public addQuestion(question_id:number, option_id:number){
		let isExist:boolean=false;
		for (var key in this.questions) {
			var obj = this.questions[key];
			if(obj.question_id==question_id) {
				isExist=true;
				obj.option_id=option_id;
			}
		}
		if(!isExist){
			this.questions.push({question_id:question_id,option_id:option_id});
		}
		
		console.log(this.questions);
	}

    constructor() {
        this.artists = [];
        this.questions = [];
        this.email = null;
        this.name = null;
        this.event_id = 0;
    }
	
}