import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { Artist } from "./artist";
import { ArtistGenre } from "./artistgenre";
import { ArtistChannel } from "./artistchannel";
import { Channel } from "./channel";
import { Genres } from "./genres";
import { WSResponse } from "../../../../ws-response";
import "rxjs/add/operator/map";

@Injectable()
export class ArtistService {

    constructor(private _httpClient: HttpClient) {

    }

    loadArtists(): Observable<Array<Artist>> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "artists/list.json").map((t: any): Array<Artist> => {
            var artists: Array<Artist> = [];
            var _artist: Artist;
            var _artistgenre: ArtistGenre;
            var _artistchannel: ArtistChannel;
            for (var i = 0; i < t.data.length; i++) {
                _artist = new Artist();
                _artist.id = t.data[i].id;
                _artist.name = t.data[i].name;
                _artist.profilePicture = t.data[i].profile_picture;
                _artist.totalview = t.data[i].video_view;
                _artist.subscribers = t.data[i].video_view;
                _artist.budget = t.data[i].budget.amount;

                // Artist Genres
                for (var g = 0; g < t.data[i].artist_genres.length; g++) {
                    _artistgenre = new ArtistGenre();
                    _artistgenre.name = t.data[i].artist_genres[g]["genre"]["name"];
                    _artist.genres.push(_artistgenre);
                }

                // Artist channel for channel total view count and subscribe

                for (var c = 0; c < t.data[i].artist_channels.length; c++) {
                    _artistchannel = new ArtistChannel();
                    _artistchannel.channel = t.data[i].artist_channels[c]["channel"];
                    _artist.channel.push(_artistchannel);
                }


                artists.push(_artist);
            }
            return artists;
        });
    }

    getArtistDetails(artistId: number): Observable<any> {
        // return this._httpClient.get<any>(environment.apiBaseUrl + "artists/getDetails/"+ artistId).map((res:Response)=> res.json());
        return this._httpClient.get<any>(environment.apiBaseUrl + "artists/" + artistId + "/getDetails.json").map((response): Artist => {
			
            var _artist: Artist;	
			
			_artist = new Artist();
			
			_artist.id=response.data.id;
			_artist.name=response.data.name;
			_artist.profilePicture=response.data.profile_picture;
			_artist.genres=response.data.artist_genres;
			_artist.channelIds= response.data.artist_channels.length > 0 ? response.data.artist_channels[0].channel.channel_ids : null;
			_artist.budgetId=response.data.budget_id;			
            return _artist;
        });
    }

    eventGenres(Params: any): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/eventGenres.json', { params: Params });
    }
    updateArtist(Data: Artist): Observable<WSResponse> {
        return this._httpClient.put<WSResponse>(environment.apiBaseUrl + "artists/update/" + Data.id + ".json", Data);
    }

    createArtist(Data: Artist): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "artists/create.json", Data);
    }

    removeArtist(teamId: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "artists/" + teamId);
    }

    deleteArtist(Id: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "artists/delete/" + Id + ".json");
    }

    deleteAllArtist(Ids: string): Observable<WSResponse> {
       // return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "artists/deleteall/'" + Ids + "'.json");
      return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "artists/deleteAll.json",  { params: Ids });
    }



    getAllGenres(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "masters/getGenres.json").map((response): Array<any> => {
            var _genres: Array<any> = [];
            //var _genre: any;
            for (var i = 0; i < response.data.length; i++) {
                let _genre: any = { id: "", name: "" }
                _genre.id = response.data[i]["id"];
                _genre.name = response.data[i]["name"];
                _genres.push(_genre);
                //console.log(_genre);
            }
            return _genres;

        });
    }
    getAllBudgets(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "masters/budgets.json").map((response): Array<any> => {
            var _budgets: Array<any> = [];
            //var _budget: any;
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