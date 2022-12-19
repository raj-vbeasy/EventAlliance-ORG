import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl, Title } from '@angular/platform-browser';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { environment } from '../../../../../environments/environment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArtistDetails } from './artistdetails.service';
import { WSResponse } from "../../../../ws-response";
//import { Genres} from './genres';
import { Observable } from 'rxjs';


import { YouTubeVideo } from "./youtubevideo";
import "rxjs/add/operator/map";
//import { Artist } from "./artist";
declare var jQuery: any;



@Component({
    selector: "app-artist-details",
    templateUrl: "./artist-details.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [ArtistDetails]

})

export class ArtistDetailsComponent implements OnInit, AfterViewInit {

    public data: any = { artist_genres: [], budget: { amount: 0 } };
    // public formData: YouTubeArtist;
    public artistVideos: Array<YouTubeVideo>;

    public videoUrl: any = null;

    public artistName: string;
    public artistImage: string;

    public artistId: number;

    public relatedArtists: Array<any> = [];

    public video: { title: string, description: string } = { title: "", description: "" };

    public chartType: string = "line";
    public chartOptions: any = { legend: false };
    public chartLabels: any = [];
    public subscribersData: any = [];
    public viewersData: any = [];
    public chartLineColors: any = [];

    public selectedEventId: number;
    public selectedEventName: string;

    public userId:number;

    public totalSubscribers: string = "0";
    public totalViews: string = "0";

    public allBudgets: Array<any>;
    public selectedBudgetId: number;

    
    public lineChartColors:Array<any> = [
    {
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }];

    constructor(private activatedRoute: ActivatedRoute, public _artistDetails: ArtistDetails, public domSanitizer: DomSanitizer, private _scriptLoaderService: ScriptLoaderService, private _titleService: Title) {

    }

    ngOnInit() {
        this._titleService.setTitle('Artist Details - Event Alliance');
        var userId = 0;
        let currentUser  = JSON.parse(localStorage.getItem('currentUser')); 
        this.userId = currentUser.id;        
    }

    ngAfterViewInit() {
       

        Helpers.setLoading(true);
        this.activatedRoute.params.subscribe((params: Params) => {            
            //

            this.artistId = params['id'];
            this.getArtistDetailForChartXAxisLevel(this.artistId);
            this.getArtistDetail(this.artistId);            
            this.getYouTubeArtist(this.artistId); 
            this.getRelatedArtistsDetails(this.artistId);          
            Helpers.setLoading(false);

        });


        this._scriptLoaderService.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {
        
            jQuery("#eventsList").select2({
                ajax: {
                    url: environment.apiBaseUrl + 'events/list.json?user_id=' + this.userId,                    
                    processResults: function(data) {                       
                        /// TODO: need to change this according to the final API 
                        var transformedData = [];
                        for (var i = 0; i < data.data.length; i++) {
                            transformedData.push({ id: data.data[i].id, text: data.data[i].name });
                        }
                        return { results: transformedData };
                    }
                }
            }).on("select2:select", (e: any) => {
                this.selectedEventId = e.params.data.id;
                this.selectedEventName = e.params.data.text;
            });
        });
    }

    addArtistButton(eventId: number = null) {        
        //Get the userid from localstorage  
        this._artistDetails.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
            if (response.status === true) {
                jQuery("#eventList").modal("hide");
                alert("The artist has been added to the event");
            } else {
                if(response.message=="MULTIEVENT") {
                    jQuery("#eventList").modal("show");
                } else {
                    alert("There was an error processing your request\n\nDetails: " + response.message);
                }
            }
        }, (err) => {
            alert("There was an error communicating with the server");
        });
    }

    editArtistBudget () {
        alert('xxxxxxx'+ this.selectedBudgetId);
        this._artistDetails.getAllBudgets().subscribe((data: Array<any>) => {

            var firstSelectElement: any = { id: "", amount: "" }
                firstSelectElement.id = 0;
                firstSelectElement.amount = "-- Select --";
                this.allBudgets = data;
                this.allBudgets.splice(0, 0, firstSelectElement);
                setTimeout(() => {
                    jQuery("#cmbBudget").select2();
                }, 200);
            console.log(data);
        jQuery("#budgetList").modal("show");
        }, (err) => {
            alert("There was an error communicating with the server");
        });
    }

    EditBudget() {
        
       this.selectedBudgetId = jQuery("#cmbBudget").val();
       // alert(this.artistId);
        alert(this.selectedBudgetId);
    }

    SaveEvent(eventId: number) {        
        this._artistDetails.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
            if (response.status === true) {
                alert("The artist has been added to the event");
                jQuery("#eventList").modal("hide");
            } else {               
                alert("There was an error processing your request\n\nDetails: " + response.message);              
            }
        }, (err) => {
            alert("There was an error communicating with the server");
        });
    }

     
    getArtistDetailForChartXAxisLevel(artistId: number) {
        Helpers.setLoading(true);
        this._artistDetails.getDetails(artistId).subscribe((t: any) => {
            
            this.data = t;
            var _graphLabels:Array<string> = [];
            var _blank: string ='';

            for(var i=0; i<this.data.channel_data.length; i++){
                let process_date_time = this.data.channel_data[i]["process_date"];
                var process_date = new Date(process_date_time);
                var updateDate = (process_date.getMonth() + 1) + '/' + process_date.getDate() + '/' + process_date.getFullYear();
                _graphLabels.push(updateDate);
                //_graphLabels.push(this.data.channel_data[i]["process_date"]);
                //_graphLabels.push(_blank);                
            }
            this.chartLabels = _graphLabels;
            Helpers.setLoading(false);
        }, (err) => {
            Helpers.setLoading(false);
            //TODO: Error handling 
        });
    }

    getArtistDetail(artistId: number) {
        Helpers.setLoading(true);
        
        this._artistDetails.getDetails(artistId).subscribe((t: any) => {
            
            this.data = t;

            var _graphLabels:Array<string> = [];
            var _graphSubscribers:Array<number> = [];
            var _graphViewers:Array<number> = [];
            //var _blank: string ='';

            var _totalSubscribers:number = 0;
            var _totalViews:number = 0;

            for(var i=0; i<this.data.channel_data.length; i++){
                _graphLabels.push(this.data.channel_data[i]["process_date"]);
                //_graphLabels.push(_blank);
                _graphSubscribers.push(this.data.channel_data[i].channel_subscriber_count);
                _totalSubscribers = this.data.channel_data[i].channel_subscriber_count;
                _graphViewers.push(this.data.channel_data[i].channel_view_count);
                _totalViews = this.data.channel_data[i].channel_view_count;
            }

            this.totalSubscribers = this.commarize(_totalSubscribers);
            this.totalViews = this.commarize(_totalViews);

            this.chartLabels = _graphLabels;

            
          
            this.subscribersData = [{data:_graphSubscribers, label: "Subscribers"}];
            this.viewersData = [{data:_graphViewers, label: "Viewers"}];
            this.chartLineColors = [{ // dark grey
              backgroundColor: 'rgba(77,83,96,0.2)',
              borderColor: 'rgba(77,83,96,1)',
              pointBackgroundColor: 'rgba(77,83,96,1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(77,83,96,1)'
            }];

            this.artistName = this.data.name;
            this.artistImage = this.data.profile_picture != null ? this.data.profile_picture : "./assets/eventalliance/media/img/no-image.jpg";
            this.selectedBudgetId = this.data.budget.id;
            /*console.log('ubscribers Data');
            console.log(this.subscribersData);
            console.log('Viewer Data');
            console.log(this.viewersData);
            console.log(this.chartLabels);*/
            Helpers.setLoading(false);
            
        }, (err) => {
            Helpers.setLoading(false);
            //TODO: Error handling 
        });
    }

    getRelatedArtistsDetails(artistId: number) {
        Helpers.setLoading(true);
         this.relatedArtists =[];
        this._artistDetails.getRelatedArtists(artistId).subscribe((t: any) => {                               
            this.relatedArtists = t;            
            Helpers.setLoading(false);
        }, (err) => {
            Helpers.setLoading(false);
        });
    }

    private commarize(input:number) {
    // Alter numbers larger than 1k
        if (input >= 1e3) {
            var units = ["Thousand", "Million", "Billion", "Trillion"];
            var order = Math.floor(Math.log(input) / Math.log(1000));

            var unitname = units[(order - 1)];
            var num = Math.floor(input / 1000 ** order);

            // output number remainder + unitname
            return num + " " + unitname
        }

        // return formatted original number
        return input.toLocaleString()
    }

    getYouTubeArtist(artistId: number) {

        this._artistDetails.getYouTubeArtistByChannel(artistId).subscribe((data: Array<YouTubeVideo>) => {
            console.log(data);
            this.artistVideos = data;
            this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + data[0].videoId);
            this.video.title = this.artistVideos[0].videoTitle;
            this.video.description = this.artistVideos[0].videoDescription;
        }, (err) => {
            console.log(err);

        });
    }

    openVideoUrl(index: number) {
        console.log(index);
        console.log(this.artistVideos);
        this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.artistVideos[index].videoId);
        this.video.title = this.artistVideos[index].videoTitle;
        this.video.description = this.artistVideos[index].videoDescription;
        var aTag = jQuery("#youtubeVideoContainer");
        jQuery('html,body').animate({ scrollTop: aTag.offset().top - 100 }, 'fast');
    }


}