import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { ArtistDetails } from '../artist-details/artistdetails.service';
import { WSResponse } from "../../../../ws-response";
import { environment } from '../../../../../environments/environment';
import { Title } from "@angular/platform-browser";

declare var jQuery: any;

@Component({
    selector: "app-about-artist",
    templateUrl: "./about-artist.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [ArtistDetails]
})

export class AboutArtistComponent implements OnInit, AfterViewInit {
    public artistId: number;
    public artistName: string;
    public data: any = { artist_genres: [], budget: { amount: 0 } };
    public artistImage: string;

    public channelDescription: string;
    public selectedEventId: number;
    public selectedEventName: string;

    public userId: number = 0 ;

    constructor(private activatedRoute: ActivatedRoute, private _artistDetailService: ArtistDetails, private _scriptLoaderService: ScriptLoaderService, private _titleService: Title) {

    }
    ngOnInit() {
        this._titleService.setTitle('About Artist - Event Alliance');
        var userId = 0;
        let currentUser  = JSON.parse(localStorage.getItem('currentUser')); 
        this.userId = currentUser.id;
    }

    addArtistButton(eventId: number = null) {        
        this._artistDetailService.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
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

    SaveEvent(eventId: number) {        
        this._artistDetailService.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
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

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((params: Params) => {
            this.artistId = params['id'];

            this._artistDetailService.getDetails(this.artistId).subscribe((t: any) => {

                this.data = t;
                this.artistName = this.data.name;
                this.channelDescription = this.data.artist_channels[0].channel["channel_description"];
                this.artistImage = this.data.profile_picture != null ? this.data.profile_picture : "./assets/eventalliance/media/img/no-image.jpg";

            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Error handling 
            });
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


}