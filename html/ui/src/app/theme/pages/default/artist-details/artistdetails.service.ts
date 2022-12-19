import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { WSResponse } from "../../../../ws-response";
import { YouTubeVideo } from "./youtubevideo";
import "rxjs/add/operator/map";

@Injectable()
export class ArtistDetails {

    private _relatedArtist: Array<any> = [];

    constructor(private _httpClient: HttpClient) {

    }

    getDetails(artistId: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "artists/" + artistId + "/getDetails.json").map((response): Array<any> => {
            return response.data;
        });
    }

    getRelatedArtists(artistId: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "artists/" + artistId + "/getRelatedArtists.json").map((response): Array<any> => {


            this._relatedArtist=[];

            for (var i = 0; i < response.data.length; i++) {

                let relatedArtist: any = {
                    artist_id: 0,
                    name: "",
                    profile_picture: "",
                    total_subscriber: 0
                }


                relatedArtist.artist_id = response.data[i].artist["id"];
                relatedArtist.name = response.data[i].artist["name"];
                relatedArtist.profile_picture = response.data[i].artist["profile_picture"];
                relatedArtist.total_subscriber = response.data[i].artist.artist_channels[0].channel["channel_subscriber_count"];
                this._relatedArtist.push(relatedArtist);

            }
           /* console.log('service--------------------');
           console.log(this._relatedArtist);*/
           return this._relatedArtist;
       });
    }

    addArtist(userId: number, artistId: number, eventId: number = null): Observable<any> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/add-artist.json", { userId: userId, artistId: artistId, eventId: eventId });
    }



    getYouTubeArtistByChannel(DBArtistID: number): Observable<Array<YouTubeVideo>> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "youtube/live/" + DBArtistID + ".json").map((response): Array<YouTubeVideo> => {
            var _youtubeArtists: Array<YouTubeVideo> = [];
            var _youtubeArtist: YouTubeVideo;

            for (var i = 0; i < response.channelVideosSearchResult.items.length; i++) {
                _youtubeArtist = new YouTubeVideo();
                _youtubeArtist.videoId = response.channelVideosSearchResult.items[i].id.videoId;
                _youtubeArtist.thumbnailsUrl = response.channelVideosSearchResult.items[i].snippet.thumbnails.default.url;
                _youtubeArtist.channelTitle = response.channelVideosSearchResult.items[i].snippet.channelTitle;
                _youtubeArtist.videoTitle = response.channelVideosSearchResult.items[i].snippet.title;
                _youtubeArtist.videoDescription = response.channelVideosSearchResult.items[i].snippet.description;
                _youtubeArtists.push(_youtubeArtist);

            }
            console.log(_youtubeArtist);

            return _youtubeArtists;

        });
    }

    getCurrentEventFromBandsintown( ArtistName: string ): Observable<any> {

        var url = decodeURIComponent('https://rest.bandsintown.com/artists/'+ArtistName.trim()+'/events?app_id=bandsintown_web');
        //console.log(url);
        return this._httpClient.get<any>(url).map((response):any => {
            //console.log('Service getCurrentEventFromBandsintown' + ArtistName.trim());
            //console.log(response);
            return response;
        });
    }

    getPastEventFromBandsintown( ArtistName: string ): Observable<any> {
        return this._httpClient.get<any>('https://rest.bandsintown.com/artists/' + ArtistName.trim() +'/events?app_id=bandsintown_web&date=past').map((response):any => {
            return response;
        });
    }


    getAllBudgets(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "masters/budgets.json").map((response): Array<any> => {
            var _budgets: Array<any> = [];            
            for (var i = 0; i < response.data.length; ++i) {
                let _budget: any = { id: "", amount: "" }
                _budget.id = response.data[i]["id"];
                _budget.amount = response.data[i]["amount"];
                _budgets.push(_budget);
            }
            return _budgets;
        });
    }


}